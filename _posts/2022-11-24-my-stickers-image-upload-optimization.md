---
layout: post
title: My Stickers App Image Upload Optimization
subtitle: 表情包图片上传优化
tags:
    - Optimization
---

## 上传流程

用户上传一个图片,采用的方案是：前端上传（减少服务器端压力），后端确认（保证安全性）。在选择图片之后有三个步骤：

1. 前端调用 API 获取上传 URL 和一次性 token (后端无网络调用,响应很快);
2. 前端使用一次性 Token 将文件上传到 API(直传到 Blob,不经过后端,此时文件不可见);
3. 前端后端 API,在 Blob 上**创建对应文件**(commit),验证之后 **写入数据库**。

![upload flow](/assets/img/my-stickers-image-upload-optimization/my-stickers-upload-call-flow.png)

为了方便上传,用户可以批量选择图片上传,但是用户批量选择大量文件，并发同时插入时，会导致数据库查询写入太多，导致数据库异常。

## 限流 (负优化)

为了减少写入的并发操作，在上传和 commit 的时候进行客户都并发限流。

-   [写入并发限制,insert 1, update 2](https://github.com/NewFuture/my-stickers/blob/main/client-config-app/src/services/http.ts#L52)
-   [Blob 并发限制,最多 6](https://github.com/NewFuture/my-stickers/blob/main/client-config-app/src/services/blob.ts#L6)

```ts
// 上传并发限制
let PENDING_REQUESTS = 0;
blob.interceptors.request.use(
    (config) =>
        new Promise((resolve) => {
            let interval = setInterval(() => {
                if (PENDING_REQUESTS < MAX_CONCURRENCY) {
                    PENDING_REQUESTS++;
                    clearInterval(interval);
                    resolve(config);
                }
            }, 200);
        })
);
blob.interceptors.response.use(
    (response) => {
        PENDING_REQUESTS = Math.max(0, PENDING_REQUESTS - 1);
        return response;
    },
    (error) => {
        PENDING_REQUESTS = Math.max(0, PENDING_REQUESTS - 1);
        return Promise.reject(error);
    }
);
```

限流之后的的瀑布流示意。
![upload throttle](/assets/img/my-stickers-image-upload-optimization/throttle-commit.png)

小文件批量上传时，会导致后面的延时很长。

## 合并插入

限流之后只是缓解了服务器段的并发，并没有减少数据库的请求，而且反而增加了批量长传的总等时间。

更好的方式是合并后端批量插入,总耗时不会更长(合并了网络请求,甚至更短),后端数据库压力也会更新。

### 前端合并

用户不停添加文件时，批量上传到 Blob，然后合并结果一次写入后端。

具体流程，前端维护一个 commit 队列

1. 上传完成后,把文件信息放入 commit 队列。
2. 检查队列是否已满，如果已满则立即把队列的内容 commit。
3. 否则检查是否有文件上传，有则等待下一个任务触发
4. 否则检查是否真正 commit，有则延时一秒批量提交
5. 否则无更多任务立即提交.

[代码实现](https://github.com/NewFuture/my-stickers/blob/main/client-config-app/src/services/stickers.ts#L63)

瀑布流示意图
![upload merge](/assets/img/my-stickers-image-upload-optimization/batch-upload.png)

### 后端批量插入

后端，分会两个步骤：写入 Blob(Commit Blob),和插入数据库(Insert DataBase);

虽然 Azure Blob 提供了 [Batch API](https://learn.microsoft.com/en-us/rest/api/storageservices/blob-batch) 但是只支持，删除和更新 tier。对于 commit 并不支持。

因此上传时采用多个请求并行上传。

### inset array

数据库层使用`Dapper`封装,默认提供了插入数组的能力

```c#
await connection.ExecuteAsync(sqlcmd, stickers);
```

但是其代码实现上采用的是`foreach`的方式，即拆成了多个数据库语句。

![loop insert](/assets/img/my-stickers-image-upload-optimization/insert-loop-batch.png)

可以看到后面一条条的数据库执行语句。虽然比外层循环快一点，但没有实现真正的批量插入。

### 数据库批量插入

绝大多数 SQL 数据都支持批量插入，这里手动拼接拼接参数列表。

```cs
string sql = $"INSERT INTO {tableName} (id,{fieldName},src,name,weight) VALUES";
var parameters = new DynamicParameters();
parameters.Add("filterId", filterId);
var sqlValues = stickers.Select((sticker, index) =>
    {
        var idKey = "id" + index;
        parameters.Add(idKey, sticker.id);
        var srcKey = "src" + index;
        parameters.Add(srcKey, sticker.src);
        var nameKey = "name" + index;
        parameters.Add(nameKey, sticker.name);
        var weightKey = "weight" + index;
        parameters.Add(weightKey, sticker.weight);
        return $"(@{idKey},@filterId,@{srcKey},@{nameKey},@{weightKey})";
    }
);
sql += string.Join(',', sqlValues);
using var connection = this.context.CreateConnection();
return await connection.ExecuteAsync(sql, parameters);
```

批量插入变成一条 SQL 语句执行。

![batch insert](/assets/img/my-stickers-image-upload-optimization/insert-batch-e2e.png)

> 注 SQL Server 的 `Bulk Insert` 批量插入性能更好,可以参考 <https://timdeschryver.dev/blog/faster-sql-bulk-inserts-with-csharp#results>

### 前端刷新防抖 (debounce)

前端上传完成后,会刷新列表来自动更新数据。

为了防止上传过程中频繁刷新,造成数据库频繁独写。在所有上传完成后进行一次刷新，并在 query 层公用请求(短时间内请求使用同一个请求)。

同时为了保证尽量图片完整压缩和缓存头处理，这里做了延迟处理，即延时几秒刷新列表。这样新图片拿到时即可直接写入浏览器缓存。

## 结果

-   单个图片上传前端体验秒传.
-   批量上传 server 端耗时大部分<1s.

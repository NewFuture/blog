---
layout: post
title: My Stickers Bot Query Optimization
subtitle: 表情包扩展Bot查询优化
tags:
    - Optimization
---

## Query 流程 关键路径

![call flow](/assets/img/my-stickers-bot-query-optimization/stickers-bot-query.png)

1. [Teams Client] 客户端点击 Teams 触发 Teams 事件事件 （完全不可控）
2. [Teams Server] Teams Server 通过 Bot Framework 调用 Stickers Bot API （基本不可控）
3. [Stickers Server] **查询用户收藏列表数据 (SQL 查询，可控)** （50 ~ 300 ms）
4. [Stickers Server] **查询 Tenant 收藏列表数据 (SQL 查询，可控)** （10 ms）
5. [Stickers Server] **查询 官方表情列表数据 (remote json ，可控)** （300 ms）
6. [Stickers Server] **生成 卡片列表 (json template ，可控)** (1~10 ms)
7. [Server Client] 返回数据到客户端 （server response to client）
8. [Client] 渲染卡片列表，下载预览图片

可优化的关键路径有四个（3.4) 壳归为一类

-   用户 和 公司 列表查询
-   官方列表查询
-   卡片生成

## 官方表情查询优化

官方表情库会自动发布到公开的静态网站上,并自动生成一个静态索引文件, 后台服务更具这个索引返回 query 的结果。

-   方案一 Lazy: Lazy
-   方案二 MemoryCache: 自动过期，重新刷新
-   方案三 后台定时刷新：Private property + timer 定时刷新 √

### 方案一 Lazy

[Lazy](https://learn.microsoft.com/en-us/dotnet/api/system.lazy-1?view=net-6.0)（和 AsyncLazy）可以延迟初始化载对象，并且可以避免重复初始话

缺点:

1. 服务部署后，列表不再刷新
2. 第一个(批)访问用户等待事件长，需要预热 (可接受)

### 方案二 MemoryCache

MemoryCache 缓存 12 小时，异步的读取。 缓存失效时，自动获取最新索引，即可保证读取速度，又可自动刷新。
缺点

1. 缓存数据失效后，刷新时户等待时间较长 (可接受)
2. (仅理论上) 缓存失效后，瞬间高并发情况下存缓存雪崩的可能性 (可接受)

### 方案三 定时刷新

维护一个不过期的变量（同步读取数据）, 后台定时刷新写入最新的数据。 (简化版的 Redis 永久缓存 + 定时 Job 刷新缓存)。
保证稳定高效的读取速度，同时数据。

缺点：

1. 服务器部署后冷启动资源消耗较多（可接受，不影响用户）。

结果：

任何时间都能保证稳定的纳秒级 List，和微秒级的搜索。

## 数据库表情查询优化

### 数据库网络

**首先数据库和 Server 部署同一个数据中心,在 Azure 同一个内网。降低 TCP 链接的延时消耗.**

实测最低网络延时能到`1ms`左右,估计平均延时<10ms.

### 用户使用场景

场景分析

1. 点击 App 列出表情包(自己列表+公司的列表+官方列表)；
2. (可能发生)输入关键词过滤表情列表；
3. 选择表情或者其它操作退出 App；

数据库查询三种情况

-   Small hot List (热查询+低延迟): < 10 ms
-   Large cold List: 100~500ms （平均 250 ms）
-   文字搜索（Like）: 100 ~500 ms

正常情况一次请求，2 次数据库查询的消耗平均总数据库耗时约 200 ~ 400ms.

### 用户列表查询

1. 使用内存缓存用户数据列表(对单个用户有效),缓存公司数据列表(对一个公司类所有员工有效);
2. 使用字符串在内存中搜索，代替数据库 Like 搜索;

Azure Web App S1 总共 1.5G 内存空间(App 启动内存 100~200M)，不考虑其它内存占用的情况，几乎可以将全部的 list 缓存到内存中。

结果：

二次打开时的 List 查询时间均可稳定在 ms 级。

## 初次查询优化

目前的缓存策略是用户列表缓存 8 小时，公司列表缓存 12 小时。（假设大部分用户都是 8 小时工作制 😄）

每天公司的第一个用户启动时间 还是需要等待两次数据库查询.

串行示意图
![serial query](/assets/img/my-stickers-bot-query-optimization/first-serial-query.png)

并行示意图
![parallel query](/assets/img/my-stickers-bot-query-optimization/first-parallel-query.png)

并行操优化

1. 取用户数据的同时立即取公司数据
2. 需要公司数据的时候在等待公司数据

代码类似

```cs
var usertikcerTask = searchService.SearchUserStickers(userId,null,cancellationToken);
var tenantStickersTask = searchService.SearchTenantStickers(tenantId, null, cancellationToken);
var stickers = await userStikcerTask; // 等待用户列表
// logic code
if (stickers.Count < skip + count)
{
    // 需要 Tenant 列表继续等待 Tenant 列表
    var tenantStickers = await tenantStickersTask;
    stickers = stickers.Concat(tenantStickers).ToList();
}
// do more
```

结果：

首次对数据库的总依赖时间变成了取决于最长的数据耗时(通常是用户数据), 一般首次查询时间在 50~200 ms 左右

## Card 生成优化

Card 生成最开始使用 json 文件，由于文件 IO 时间波动较大.

1. 优化一 Cache json 文件 （<1ms, 波动大）
2. 优化二 完全使用 Class + Object 来声明卡片内容(<1 微秒级转换,稳定)。

详细说明和对比 <https://blog.newfuture.cc/performance-of-adaptivecard-template-rendering/>

## DNS 优化

从 Bot 的 我们 server 直接的调用基本区间于两这直接的网络连接状况, 二者都在 Azure 上(Bot 可能从不同 Region 发起,默认走 Azure 网络，基本比较稳定，但不可控)。

还有一步，DNS 解析可能存出现高延迟的情况。
(由于 `stickers-xxx.newfuture.cc` 是用的境内 DNS 服务商, 在不同的 Azure 上查询 DNS 不能保证快速响）,
因此在 Bot handler 配置 `stickers-xxx.azurewebsites.net` 可以保证更稳定更快的解析。

## 优化结果

![Bot API Latency](/assets/img/my-stickers-bot-query-optimization/bot-api-latency.png)

| 百分位 | 延迟  | 说明                          |
| :----: | :---: | :---------------------------- |
|  P50   | 7.5ms | 一半的请求在 7.5ms 以内返回   |
|  P95   | 350ms | 绝大多数请求在 350ms 以内返回 |
|  P99   | 830ms | 极少数请求时超过 830ms        |

(注: 其中 Bot 还有收藏表情的功能，需要检索和写入数据库)

进一步优化的空间,分析和优化极端情况下的请求耗时。

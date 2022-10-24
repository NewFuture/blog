---
layout: post
title: Azure Function Blob Trigger Polling
subtitle: Blob Trigger 轮询的机制和坑
tags:
    - test
---

[My Stickers ](https://github.com/NewFuture/custom-stickers-teams-extension/tree/main/image-functions) 使用 Azure Function App, 通过 Blob Trigger 完整图片自动转换，压缩，和调整大小的功能。

但实际上线后，在存量数据(大约 15 万个文件)处理完后，处理函数触发的次数不多，但是 blob 的 query 次数和数据流量却十分大。

## 函数日志 (Blob Trigger Log)

通过截取部分测试环境 Function App 的实时日志

```log
[Verbose]   Poll for blobs newer than '2022-10-20T09:34:48.999Z' in container 'public' with ClientRequestId '69989f60-a0a2-4c60-a518-9e79534cf694' found 0 blobs in 22594 ms. ContinuationToken: True.
[Verbose]   Poll for blobs newer than '2022-10-20T09:34:48.999Z' in container 'public' with ClientRequestId 'aaba7890-10b5-4b22-9271-2917505574de' found 1 blobs in 4272 ms. ContinuationToken: False.
[Verbose]   Blob 'container/79ae82c1-13ca-4cbf-a90f-537a7bf8273c.png' will be skipped for function 'funcName' because this blob with ETag '"0x8DAB27E553ECFFF"' has already been processed. PollId: 'aaba7890-10b5-4b22-9271-2917505574de'. Source: 'ContainerScan'.
[Verbose]   Poll for function 'funcName' on queue 'FUNC_APP' with ClientRequestId '8dc86586-20eb-46e6-9262-a230a863d9b1' found 0 messages in 8 ms.
[Verbose]   Function 'funcName' will wait 60000 ms before polling queue 'FUNC_APP'.
[Verbose]   Poll for function 'funcName' on queue 'FUNC_APP' with ClientRequestId 'ad030d0c-9796-4931-9379-820a93a46e91' found 0 messages in 5 ms.
[Verbose]   Function 'funcName' will wait 21566.0114 ms before polling queue 'FUNC_APP'.
[Verbose]   Poll for blobs newer than '2022-10-20T09:34:49.000Z' in container 'public' with ClientRequestId '88a30359-9854-483e-abb0-b58a78ccba71' found 0 blobs in 10735 ms. ContinuationToken: True.
[Verbose]   Poll for function 'funcName' on queue 'FUNC_APP' with ClientRequestId '2dd0c94c-d4da-4778-b925-1ac82da48a4b' found 0 messages in 9 ms.
[Verbose]   Function 'funcName' will wait 60000 ms before polling queue 'FUNC_APP'.
[Verbose]   Poll for function 'funcName' on queue 'FUNC_APP' with ClientRequestId '751f6063-9de8-4cb9-ac89-a872ae6c9348' found 0 messages in 7 ms.
[Verbose]   Function 'funcName' will wait 47149.2141 ms before polling queue 'FUNC_APP'.
[Verbose]   Poll for function 'funcName' on queue 'FUNC_APP' with ClientRequestId '4dfae540-6126-421d-87cb-97d425449374' found 0 messages in 10 ms.
[Verbose]   Function 'funcName' will wait 60000 ms before polling queue 'FUNC_APP'.
[Verbose]   Poll for function 'funcName' on queue 'FUNC_APP' with ClientRequestId '351ae9d1-33e6-41bf-90f0-02ce8d0c8dea' found 0 messages in 9 ms.
[Verbose]   Function 'funcName' will wait 60000 ms before polling queue 'FUNC_APP'.
[Verbose]   Singleton lock acquired (FUNC_APP/WebJobs.Internal.Blobs.Listener)
[Verbose]   Poll for blobs newer than '2022-10-20T09:34:48.999Z' in container 'public' with ClientRequestId 'fc1bb180-6164-4e39-81a6-f2b89bdcce33' found 0 blobs in 15797 ms. ContinuationToken: True.
[Verbose]   Poll for function 'funcName' on queue 'FUNC_APP' with ClientRequestId '32153385-83db-4684-bd07-ebc7e4ab746a' found 0 messages in 8 ms.
[Verbose]   Function 'funcName' will wait 60000 ms before polling queue 'FUNC_APP'.
[Verbose]   Singleton lock acquired (FUNC_APP/WebJobs.Internal.Blobs.Listener)
[Verbose]   Poll for blobs newer than '2022-10-20T09:34:48.999Z' in container 'public' with ClientRequestId '491c959b-dd47-4589-a348-1426c7b1fe9d' found 0 blobs in 10278 ms. ContinuationToken: True.
[Verbose]   Poll for function 'funcName' on queue 'FUNC_APP' with ClientRequestId '14d82a86-b8e2-47ee-a8be-4cf5177a184f' found 0 messages in 8 ms.
[Verbose]   Function 'funcName' will wait 60000 ms before polling queue 'FUNC_APP'.
[Verbose]   Poll for blobs newer than '2022-10-20T09:34:48.999Z' in container 'public' with ClientRequestId '333ad8bf-dc46-426e-9577-77a20a8736ae' found 0 blobs in 19699 ms. ContinuationToken: True.
[Verbose]   Poll for blobs newer than '2022-10-20T09:34:48.999Z' in container 'public' with ClientRequestId '3b84d90f-17ba-4177-9e31-2349f99d79b9' found 0 blobs in 12081 ms. ContinuationToken: True.
[Verbose]   Poll for blobs newer than '2022-10-20T09:34:48.999Z' in container 'public' with ClientRequestId '6773a4fd-9e04-4d50-b4a4-f147376cf316' found 1 blobs in 2998 ms. ContinuationToken: False.
[Verbose]   Blob 'container/79ae82c1-13ca-4cbf-a90f-537a7bf8273c.png' will be skipped for function 'funcName' because this blob with ETag '"0x8DAB27E553ECFFF"' has already been processed. PollId: '6773a4fd-9e04-4d50-b4a4-f147376cf316'. Source: 'ContainerScan'.
```

会发现在一直重复 Poll, 然后比较每一个的 ETag 看是否处理过，Poll 需要读取文件 log, 检查 Etag 又需要批量 query properties。在文件数据量多(接近 10 万级)，所以就会发现 Blob 一直在高负荷运行中，同时数据量越大导致，log 记录丢的概率更加增大。

## polling 轮询机制

[其内部实现是通过轮询 log 和 扫描存储来实现](https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-storage-blob-trigger?tabs=in-process%2Cextensionv5&pivots=programming-language-csharp#polling-and-latency)

> Polling works as a hybrid between inspecting logs and running periodic container scans. Blobs are scanned in groups of 10,000 at a time with a continuation token used between intervals. If your function app is on the Consumption plan, there can be up to a 10-minute delay in processing new blobs if a function app has gone idle.

这个在文件数量大的时候就是大坑:

1. 轮询频繁,对 blob 产生**大量的请求** (文件在每次 poll 中都会触发)
2. log 不准确，和标记不准确，会导致较多的文件被**多次重复处理**

结果就是，Blob 响应性能低，但是 cost 高，函数处理慢。

## 解决方案 （event）

另一中处理方案是通过[事件 event 来触发函数](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-event-overview#filtering-events)来替换 Blob trigger。

代码上的核心改动

```diff
- public void Run([BlobTrigger("stickers/{name}")] BlobClient imageBlobClient, ILogger log)
+ public void Run([EventGridTrigger] EventGridEvent event, [Blob("{data.url}", FileAccess.ReadWrite)] BlobClient imageBlobClient ILogger logger )
```

过滤的 filter 则从函数中的`stickers/{name}`改到 event 中的前缀`/blobServices/default/containers/stickers/`。

[详细代码更改 PR](https://github.com/NewFuture/custom-stickers-teams-extension/pull/280/files)

## 效果

-   触发更快(分钟级触发变成 ms 级触发), Function App 热启动状态下，图片自动处理是秒级的完成，冷启动状态下分钟级完成。
-   基本不会重新触发(event create 和 update 是两个事件, Blob Trigger 是一个事件)
-   浏览和请求数骤减(1000 倍变化)

![query count](/assets/img/azure-blob-trigger-polling/query-count.png)

## 启发

-   尽量使用 event trigger 来进行 Blob 处理文件
-   对于存量数据可以先使用 blob trigger 处理已有文件 (Event Trigger 对于没有变化的文件不会触发)

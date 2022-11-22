---
layout: post
title: My Stickers Config App with API Optimization
subtitle: 表情包应用管理页子应用优化
private: true
tags:
    - Optimization
---

## 首次打开

-   CDN + http2 优化网页和 js 下载速度
-   Preconnect 加快 Server 请求
-   CORS Simple Request

![default waterfall for static site](/assets/img/my-stickers-config-app-with-api-optimization/waterfall-default.png)

其中:

1. 下载 html 页面
2. 下载 js bundles (库)
3. 下载 js bundles (库)
4. 下载 js 文件(并行)
5. 下载图标(iframe 中可忽略)
6. 请求用户表情列表

### CDN + http2

可以看到 1，2，3,4 个请求共建立了三个请求(tcp connection + ssl),虽然 1,2 实际上复用了同一个连接(`keep alive`).

使用 http2 可以将四个合并为一个 TCP 连接。

![http2 + cdn](/assets/img/my-stickers-config-app-with-api-optimization/waterfall-http2.png)

可以看到 html 之后的 js 没有 connect 和 ssl 握手阶段，复用了同一个连接。

### Preconnect

可以发现 6 调用 API(另外一个域名)的请求在，js 执行完之后才开始。
这个过程又重新进行 DNS,建立 TCP,SSL 握手，然后发送请求。

![https connection](/assets/img/my-stickers-config-app-with-api-optimization/first-request.png)

第一次打开这个 APP，这个 URL 从来没有发送过，请求的情况下，这些准备阶段很可能会耗时比较长(X00ms 到 1s,极端情况下会更长.)

`preconnect` 可以在下载 JS 的同时取提前建立连接

```html
<link rel="preconnect" href="https://stickers-test-server.azurewebsites.net" crossorigin />
```

![preconnect](/assets/img/my-stickers-config-app-with-api-optimization/waterfall-preconnect.png)

可以发现 6z 的 connect 和 ssl 已经在 JS 下载阶段就完成，JS 执行后立即就开始了 request.

### More

-   使用 Azure Front Door (价格更高): 同一个域名,避免跨域预检和客户都链接，并提高 API 网络的稳定性；
-   CDN 预取 CDN preload (需要 Premium 版): 提前分发到边缘节点。
-   http2 push (Azure CDN 不支持): 下载 html 时主动推送 js 文件。
-   http3 (UDP) 可以跳过握手阶段。

## 再次打开

-   资源文件永久缓存
-   图片自动压缩+永久缓存
-   Client Cache

## 上传

-   批量上传
-   上传限流
-   合并插入
-   数据库 Bulk 插入

https://timdeschryver.dev/blog/faster-sql-bulk-inserts-with-csharp#results

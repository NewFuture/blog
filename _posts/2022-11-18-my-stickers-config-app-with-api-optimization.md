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
3. 下载 js 文件(并行)
4. 请求用户表情列表

### CDN + http2

可以看到 1，2，3,4 个请求共建立了三个请求(tcp connection + ssl),虽然 1,2 实际上复用了同一个连接(`keep alive`).

使用 http2 可以将四个合并为一个 TCP 连接。

![http2 + cdn](/assets/img/my-stickers-config-app-with-api-optimization/waterfall-http2.png)

可以看到 html 之后的 js 没有 connect 和 ssl 握手阶段，复用了同一个连接。

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

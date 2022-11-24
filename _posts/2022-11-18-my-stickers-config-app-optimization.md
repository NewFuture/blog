---
layout: post
title: My Stickers Config App with API Optimization
subtitle: 表情包应用管理页子应用优化
tags:
    - Optimization
---

## 首次打开

-   CDN + http2 优化网页和 js 下载速度
-   Preconnect 加快 Server 请求
-   CORS Simple Request

![default waterfall for static site](/assets/img/my-stickers-config-app-optimization/waterfall-default.png)

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

![http2 + cdn](/assets/img/my-stickers-config-app-optimization/waterfall-http2.png)

可以看到 html 之后的 js 没有 connect 和 ssl 握手阶段，复用了同一个连接。

### Preconnect

可以发现 6 调用 API(另外一个域名)的请求在，js 执行完之后才开始。
这个过程又重新进行 DNS,建立 TCP,SSL 握手，然后发送请求。

![https connection](/assets/img/my-stickers-config-app-optimization/first-request.png)

第一次打开这个 APP，这个 URL 从来没有发送过，请求的情况下，这些准备阶段很可能会耗时比较长(X00ms 到 1s,极端情况下会更长.)

[`preconnect`](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types/preconnect) 可以在下载 JS 的同时取提前建立连接

```html
<!-- API -->
<link
    rel="preconnect"
    href="https://stickers-test-server.azurewebsites.net"
    crossorigin
/>
<!-- 图片 -->
<link rel="preconnect" href="https://stickers.newfuture.cc" />
```

HTTP HEADER 中

```header
Link: <https://stickers-api.newfuture.cc>;rel="preconnect";crossorigin, <https://stickers.newfuture.cc>;rel="preconnect"
```

![preconnect](/assets/img/my-stickers-config-app-optimization/waterfall-preconnect.png)

可以发现 6 的 connect 和 ssl 已经在 JS 下载阶段就完成，JS 执行后立即就开始了 request.

注意`crossorigin`属性

> https://crenshaw.dev/preconnect-resource-hint-crossorigin-attribute/ > https://stackoverflow.com/questions/74144075/why-crossorigin-attribute-matters-for-preconnect-links
>
> -   用于页面标签(加载 js/img 等)如果标签有`crossorigin`属性则保持一致;
> -   预先连接跨域的`<script type=module>` 和跨域字体文件 必须使用`crossorigin`
> -   对于 fetch or XHR 请求: withCredentials 模式(带 cookie 认证信息) 使用`crossorigin=use-credentials` 否则使用`crossorigin`

### CORS preflight

再来看具体的数据请求，会发现实际上一次确 query 会发现两条 HTTP request。

在 GET 请求之前会有一个 Options 请求确认`CORS`信息 (这个测试中大概 900ms)
![preflight](/assets/img/my-stickers-config-app-optimization/preflight-timeline.png)

![preflight in waterfall](/assets/img/my-stickers-config-app-optimization/waterfall-preflight.png)

```timeline
/me/stickers OPTIONS 200
/me/stickers GET 200
```

要想避免第一个`OPTIONS`请求,两种方式

-   避免跨域使用同一个域名 (推荐, 可以使用 AFD 之类动态 CDN 的)
-   使请求变成 [Simple Requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#simple_requests) 跳过 preflight 预检 (奇技淫巧)

由于需要认证,这里使用的是把 `Authorization` 隐藏在 `Content-Language` 中.

> 这种方式存在兼容性的风险,谨慎使用。

### More

-   使用 Azure Front Door (价格更高): 同一个域名,避免跨域预检和客户都链接，并提高 API 网络的稳定性；
-   CDN 预取 CDN preload (需要 Premium 版): 提前分发到边缘节点。
-   http2 push (Azure CDN 不支持): 下载 html 时主动推送 js 文件。
-   http3 (Azure CDN 不支持): UDP 可以跳过握手阶段。

### 首次打开效果

测试过多次(即 CDN 和 DNS 预热过)
![first run](/assets/img/my-stickers-config-app-optimization/first-run.png)

|    标志     | 耗时  | 说明                                           |
| :---------: | :---: | :--------------------------------------------- |
| First Byte  | 0.2s  | 接收到服务器端响应(反应准备阶段耗时)           |
|     FCP     | 0.35s | 第一次渲染有效内容 (用户看见 loading 转圈)     |
| Speed Index | 1.5 s | 用户页面渲染完成 (显示列表文字,但图片加载完成) |
|     LCP     | 2.68s | 全部内容都渲染,所有图片都完全加载完成          |

## 再次打开

-   资源文件永久缓存
-   图片自动压缩+永久缓存
-   Client Cache

### js 文件永久缓存

由于 js 使用了内容 hash,内容变化后文件名会发生变化,因此 js 文件可以永久缓存,不需要额外的 http 304 确认。

详细查看 [静态网站优化](/my-stickers-static-website-optimization/)

### 图片自动压缩+永久缓存

对于用户上传的图片，使用统一的压缩处理，并且添加 `public,max-age=15552000,immutable` 缓存控制,让客户都可以永久缓存。

### 客户端 Client Cache

为了让内容尽快的显示，会将列表缓存到本地`localStorage`,在用户下次打开的时候先显示本地缓存(此时不可编辑),同时去 server 端同步最新的列表。

client 使用了`useSWR`来管理同步 server 端的 list.
在 fallback 的时使用本地缓存内容。

### 二次打开效果

重新打开是在刚关闭弹窗, 再次打开的情况，所有缓存都存在。

![re run](/assets/img/my-stickers-config-app-optimization/re-run.png)

|    标志     | 耗时  | 说明                                       |
| :---------: | :---: | :----------------------------------------- |
| First Byte  | 0.16s | 接收到服务器端响应(反应准备阶段耗时)       |
|     FCP     | 0.32s | 第一次渲染有效内容 (用户看见 loading 转圈) |
| Speed Index | 0.45s | 用户页面渲染完成 (显示列表框架和文字)      |
|     LCP     | 0.6s  | 全部内容都渲染,所有图片都完全加载完成      |

## 上传

为了方便上传,允许用户批量选择图片上传。

-   上传限流(负优化)
-   合并插入
-   数据库 Bulk 插入

https://timdeschryver.dev/blog/faster-sql-bulk-inserts-with-csharp#results

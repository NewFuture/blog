---
layout: post
title: My Stickers Static Website Optimization
subtitle: 表情包纯静态网站优化
tags:
    - Optimization
---

[Sticker 官网](https://sticker.newfuture.cc)是一个纯静态的展示网站.

## inline css

不同于 config app.

此页面基于 `@fluentui/react-northstar` 实现的。不支持预编译 css。
代码中我们使用了部分 scss. 我们可以发现打包后的 css 样式文件非常小(573B <1KB),因此直接嵌入到 HTML 中效果更好。

```
 573 B      build\static\css\main.008bf1c9.css
```

使用 [html-inline-css-webpack-plugin](https://github.com/Runjuu/html-inline-css-webpack-plugin) 将打包的 css 文件嵌入到 html 中

```html
<link href="/static/css/main.008bf1c9.css" rel="stylesheet" />
```

```html
<style type="text/css">
    /* ... */
</style>
```

此时页面下载完成即可立即渲染页面样式,而不必再去下载 css.

## prerender

-   正常流程 `HTML(Entry)`->`JS`->`render`-> `[UI]`
-   Prerender `HTML(Prerender)`-> `[UI]` -> `JS` -> `hydrate`

[prerender react with react snap](/prerender-react-with-react-snap),这样在下载完的 HTML 即可完整显示所要呈现的内容，而不必等 js 下载完在等 JS 执行.

这是在无 CDN 缓存情况下两种渲染的对比.

![jsrender](/assets/img/my-stickers-static-website-optimization/js-render-video.gif)
![prerender](/assets/img/my-stickers-static-website-optimization/prerender-video.gif)

| 关键节点                 | 普通渲染  | 预渲染    | 说明                               |
| :----------------------- | :-------: | :-------- | :--------------------------------- |
| First Byte               |  1.16 s   | 1.56 s    | 收到 server 端返回的 HTML          |
| Document Complete Time   |   4.3 s   | 4.4 s     | js 等加载完成                      |
| First Contentful Paint   |   4.5 s   | 1.6 s     | 有效内容绘制开始 (快三倍)          |
| Largest Contentful Paint | **6.3 s** | **3.7 s** | 最大内容绘制完成 (包括图片) 快两倍 |

这是在同一节点，Purge 完 CDN 之后的测试结果。

-   可以看到预渲染的页面，在 1.6s 之后页面已经显示出来, 3.7s 就已经完全显示了。
-   但是普通渲染,4.3s 才开始渲染,(其中有>200ms 的阻塞渲染时间)，6.3s 才完全渲染完。

预渲之后的页面，显示更快，而且没有渲染的卡顿。

## 常规优化

### 图片 lazy loading

首页有三屏内容显示。对于第二屏和第三屏的图片加上 `loading="lazy"` 可以降低图片的下载的优先级延迟加载这部分图片。把更多的带宽留给首屏的图片和视频。

这样让首屏内容更快显示。

> 注意: 图片尽量设置宽带和高度

### preload video

-   [Link Preload](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types/preload#browser_compatibility)

```html
<link rel="preload" href="/video/my-stickers-v2.mp4" as="video" />

<!-- 
    chrome 浏览器没有实现 as = video,
    chrome 不支持 type
-->
<!-- <link rel="preload" href="/video/my-stickers-v2.mp4" as="video" type="video/mp4" /> -->
```

```
Link: </video/my-stickers-v2.mp4>;as="video";rel="preload";
```

### 缓存控制

-   [Cache Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
-   [Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching#common_caching_patterns)

对于 JS 图片视频等文件，内容不会变，为了更有效的利用缓存，减少请求。

`/`缓存头

```

Cache-Control: max-age=86400

```

HTML 页面可缓存一天(86400s).

`xx.js`等资源文件缓存

```

Cache-Control: max-age=63072000,immutable

```

资源文件缓存 2 年,`immutable`内容不可变(无需 304 validation 确认)

![cache settings](/assets/img/my-stickers-static-website-optimization/cache-setting.png)

### 效果

[pagespeed (lighthouse)性能评分](https://pagespeed.web.dev/report?url=https%3A%2F%2Fsticker.newfuture.cc%2F&form_factor=desktop)

![lighthouse score](/assets/img/my-stickers-static-website-optimization/lighthouse.png)

## DNS 和 CDN 的问题

用上 CDN 并不能保证网站访问速度一定很快，冷启动可能同样会很慢。

1. DNS 的时间消耗有些时候并不是可以忽略的,
2. CDN 跨区域回源的时间可以能会很长.

下面是[监测网站首页的响应时间](https://status.sticker.newfuture.cc/)(时间波动范围比较大和每次 DNS 状态和 CDN 装有关)

![cache settings](/assets/img/my-stickers-static-website-optimization/connection-time.png)

可以看到法国的节点,DNS 和 CDN 都处于冷启动状态,DNS 耗时 331 ms,CDN 下载耗时 928ms. 这些事件则不可忽略。

## 分析工具

-   <https://www.webpagetest.org/>
-   <https://pagespeed.web.dev/>

```

```

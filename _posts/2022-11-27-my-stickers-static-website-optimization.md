---
layout: post
title: My Stickers Static Website Optimization
subtitle: 表情包纯静态网站优化
private: true
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

## lazy loading

## 资源文件永久缓存

## preload video

https://www.webpagetest.org/
https://pagespeed.web.dev/

https://status.sticker.newfuture.cc/

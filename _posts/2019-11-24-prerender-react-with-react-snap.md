---
layout: post
title: Pre-render React with react-snap
subtitle: 使用react-snap对react页面进行预渲染
tags:
  - React
  - Front-End
---

## 什么是预渲染 {#pre-render}

> 预渲染(`pre-render`)是提前将静态页面内容进行渲染，用来优化页面响应，SEO 以及生成静态页面.

流行的渲染工具(基于无 puppeteer 浏览器实现)

- [prerender-spa-plugin](https://github.com/chrisvfritz/prerender-spa-plugin) webpack 插件
- [react-snap](https://github.com/stereobooster/react-snap) 命令行工具

### 单页应用渲染过程 {#spa-page-render}

1. 获取入口 html 文件
2. 下载 JS 文件
3. 执行 JavaScript 挂载 DOM 节点
4. 渲染 UI

常见的前端框架在入口处会有类似如下的挂载操作。

将整个 APP 的内容注入到 html 的某个节点

- React

```jsx
// React 入口 index.jsx
// 挂载到 #root
React.render(<App />, document.getElementById("root"));
```

```html
<!-- React 入口文件 index.html  -->
<div id="root"></div>
```

- Vue

```js
// vue 入口js main.js
// 挂载到 #app
new Vue({ el: "#app", render: h => h(App) });
```

```html
<!-- Vue入口文件 index.html -->
<div id="app">Loading...</div>
```

- Angular

```ts
// Angular 的更目 app module
// 注入到 app-root 节点
@Component({ selector: 'app-root'})
//...
```

```html
<!-- Angular 入口文件 index.html -->
<app-root>Loading...</app-root>
```

在 js 加载和执行完成(第`3`步)之前，页面一直是空白状态(第`1`步的结果)。

预渲染的作用根据页面路由，在页面下载完的时候(第`1`步就拿到渲染的结果)。

以[这个页面](https://sticker.newfuture.cc/)为例

- 未启用预渲打开 chrome 调试工具预览，**显示为白屏**

![build wihtout pre-render](/assets/img/prerender-react-with-react-snap/dev-preview.png)

- 预渲染后打开 chrome 调试工具预览，**渲染之后的显示界面一致**

![build with pre-render](/assets/img/prerender-react-with-react-snap/prerender-preview.png)

### 预渲染和普通渲染时间比较

截取一个 chrome 页面加载时间轴(waterfall)

![build with pre-render](/assets/img/prerender-react-with-react-snap/waterfall.png)

| 事件      | 耗时              | 总耗时                        |
| --------- | ----------------- | ----------------------------- |
| html 下载 | 637ms             | 637ms                         |
| js 下载   | 1420ms (并行最长) | 2075ms                        |
| 图片下载  | 623ms             | 1260ms<br>(无预渲染为 2698ms) |

有预加载时，大概 0.6s 左右页面开始渲染，看到界面，1.2s 左右能看到图片.

无预加载时，大概 2s 左右开始渲染页面，2.7s 左右看到图片(忽略了 js 执行时间，实际更长)

### 预渲染 和 服务器端渲染 {#prerender-ssr}

预渲染（Pre-render）和服务器端渲染(Server-Side-Render)都是提前渲染 HTML，加快页面呈现速度。

区别在于:
服务器端渲染更具参数动态渲染不同内容,比如不同 id 渲染出不同的详情页面给客户端,
类似于 PHP 渲染模板,Java 渲染的 JSP,或者.net 的 aspx/cshtml

而预渲染，则通常是更具不同的路由渲染出不同的页面出来，类似于 Jekyll,Gitbook 这种静态网站页面生成。

## react-snap 预渲染参数

React Snap 号称是无需配置的预渲染工具。
安装完，加一行命令即可在 build 完成之后自动进行预渲染。

```json
{
  "scripts": {
    "postbuild": "react-snap"
  }
}
```

### React 预渲染优化

react 提供了 [hydrate](https://zh-hans.reactjs.org/docs/react-dom.html#hydrate) 方法，用来合并已有的元素避免再次重新渲染整个`root`节点。(虽然`hydrate`是为服务器端渲染提供的，但是在预渲染的场景同样适用)

```jsx
import { hydrate, render } from "react-dom";

const root = document.getElementById("root");
// render(<App />, rootElement); 换成
if (root.hasChildNodes()) {
  // 在已经预渲染的情况下，执行 hydrate
  hydrate(<App />, root);
} else {
  render(<App />, rootElement);
}
```

这样当 JS 开始执行的时候，react 会之间在现有的 dom 上进行事件绑定，而不是删除现有元素重新渲染所有节点.

### 参数

通过在`package.json`中的指定`"reactSnap"`配置

```json
{
  "reactSnap": {}
}
```

是通过[源码](https://github.com/stereobooster/react-snap/blob/master/index.js)可以找到所有的配置项

```js
{
  //# stable configurations
  port: 45678,
  source: "build",
  destination: null,
  concurrency: 4,
  include: ["/"],
  userAgent: "ReactSnap",
  // 4 params below will be refactored to one: `puppeteer: {}`
  // https://github.com/stereobooster/react-snap/issues/120
  headless: true,
  puppeteer: {
    cache: true
  },
  puppeteerArgs: [],
  puppeteerExecutablePath: undefined,
  puppeteerIgnoreHTTPSErrors: false,
  publicPath: "/",
  minifyCss: {},
  minifyHtml: {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    decodeEntities: true,
    keepClosingSlash: true,
    sortAttributes: true,
    sortClassName: false
  },
  // mobile first approach
  viewport: {
    width: 480,
    height: 850
  },
  sourceMaps: true,
  //# workarounds
  // using CRA1 for compatibility with previous version will be changed to false in v2
  fixWebpackChunksIssue: "CRA1",
  removeBlobs: true,
  fixInsertRule: true,
  skipThirdPartyRequests: false,
  cacheAjaxRequests: false,
  http2PushManifest: false,
  // may use some glob solution in the future, if required
  // works when http2PushManifest: true
  ignoreForPreload: ["service-worker.js"],
  //# unstable configurations
  preconnectThirdParty: true,
  // Experimental. This config stands for two strategies inline and critical.
  // TODO: inline strategy can contain errors, like, confuse relative urls
  inlineCss: false,
  //# feature creeps to generate screenshots
  saveAs: "html",
  crawl: true,
  waitFor: false,
  externalServer: false,
  //# even more workarounds
  removeStyleTags: false,
  preloadImages: false,
  // add async true to script tags
  asyncScriptTags: false,
  //# another feature creep
  // tribute to Netflix Server Side Only React https://twitter.com/NetflixUIE/status/923374215041912833
  // but this will also remove code which registers service worker
  removeScriptTags: false
};
```

#### skipThirdPartyRequests

默认会模拟发送网络请求，如果涉及到动态数据(如需要登录),可以通过这个配置关闭这个

#### inlineCss

设置 true 可以压缩初次渲染的 css，如果出现异常可以关闭。

#### crawl

默认 react-snap 会采用爬虫的方式(寻找所有的`a`标签)然后渲染本站的所有链接。

但是有些场景可能只需要渲染特点的页面，可以设置 为 false 配合 `include`只抓取特点页面。

#### include

指定要爬取的页面如`["/","/about.html"]`,则会从这两个页面路由开始生成预渲染。如果`crawl`设置 false 则会只生成这两页预渲染。

#### preloadImages

如果页面引用图片是固定的，可以将`preloadImages`设置为 true。
在浏览器解析 html 的 head 后会同时预取需要的图片。

## 样式兼容

### Fela 样式兼容

## 参考

- <https://github.com/stereobooster/react-snap>
- <https://github.com/chrisvfritz/prerender-spa-plugin#what-is-prerendering>

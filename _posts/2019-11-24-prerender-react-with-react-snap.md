---
layout: post
title: Pre-render React with react-snap
subtitle: 使用react-snap对react页面进行预渲染
private: true
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

## 样式兼容

## Fela 样式兼容

## 参考

- <https://github.com/stereobooster/react-snap>
- <https://github.com/chrisvfritz/prerender-spa-plugin#what-is-prerendering>

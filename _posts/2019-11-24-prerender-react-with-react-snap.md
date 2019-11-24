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

### 预渲染

> 预渲染是提前将静态页面内容进行渲染，用来优化页面响应，SEO 以及生成静态页面.

### 单页应用渲染过程 {#spa-page-render}

1. 获取入口html文件
2. 下载JS文件
3. 执行JavaScript 挂载DOM节点
4. 渲染UI


常见的前端框架在入口处会有类似如下的挂载操作。

将整个APP的内容注入到html的某个节点

* React 
```jsx
// React 入口 index.jsx
// 挂载到 #root
React.render(<App />, document.getElementById("root"));
```
```html
<!-- React 入口文件 index.html  -->
<div id="root"></div>
```
* Vue
```js
// vue 入口js main.js
// 挂载到 #app
new Vue({ el: '#app', render: h => h(App) });
```
```html
<!-- Vue入口文件 index.html -->
<div id="app">Loading...</div>
```
* Angular
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

在js加载和执行完成(第`3`步)之前，页面一直是空白状态(第`1`步的结果)。

预渲染的作用根据页面路由，在页面下载完的时候(第`1`步就拿到渲染的结果)。

以[这个页面](https://sticker.newfuture.cc/)为例

未启用预渲打开chrome调试工具预览
![build wihtout pre-render](/assets/img/prerender-react-with-react-snap/dev-preview.png)

预渲染后打开chrome调试工具预览
![build with pre-render](/assets/img/prerender-react-with-react-snap/prerender-preview.png)

### 预渲染 和 服务器端渲染 {#prerender-ssr}


## react-snap 预渲染参数

## React 预渲染优化

## Fela 样式兼容

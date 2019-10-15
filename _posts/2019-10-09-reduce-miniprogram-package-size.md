---
layout: post
title: Reduce MiniProgram Package Size (微信小程序包体积优化)
tags:
  - MiniProgam
  - Front-End
---

> 小程序对包的体积大小有限制(微信小程序目前限制上限 2MB)；
> 小程序分发流程是先上打包传到服务器，首次使用(或升级)的时候下载到客户端解压，然后执行；
> 包的大小会影响下载速度，如体积较大在移动端网络不稳定时会严重下载成功率。
> 实际将 2000KB 左右的小程序优化到 600KB 左右,平均下载时间减少接近 60%

## 提要

由于小程序在项目打包上传的时候，会对项目文件进行压缩(js,wxss 均会压缩,wxml 会转换成 js 代码);
体积优化的内容这部分不用做太多处理。

- 项目文件结构
- 资源图片
  - 尽量减少本地资源
  - 压缩图片
- npm 包(JS)
  - 合理使用 npm,减少依赖
  - 使用相同版本
  - 包合并和 tree-shaking
- 样式文件
  - 合并公有样式
  - 压缩内联图片
  - css 压缩
- 自动化处理
- 实际情况

## 合理的项目结构

项目结构本身通常不会对包体积大小没有太大影响，但是却关系到资源的管理和维护。
合理的文件结构可以更方便的管理依赖文件，和方便自动化的优化压缩处理。

通常将 原文件目录和输出目录分开，例如

```
Project
│
├─ src/ 【源文件目录】
|   │
|   ├─ pages/ 【页面定义】
|   ├─ img/   【图片资源文件】
|   └─ ...其他
└─ dist/ 【调试和打包输出目录】

```

## 图片资源文件

图片资源通常最可能成为小程序体积增长的原因。基本原则是`尽量少尽量小`。

### 尽量减少图片资源

1. 删除不在引用和用不到的图片资源;
2. 尽量考虑放到在线 CDN 或者静态存储服务器上.

第一点如果文件命令和项目结构清晰很容易管理和确定。
第二点基本原则是需要在离线情况也能显示的放在本地，不允许出现图片加载过程的放到本地，通用的 placeholder 也可以放到本地。实际项目打包的图片应该是类似图标类图片，小的图片 placeholder。如果图片体积超过 100K 考虑能否放到 CDN 上。

### 尽量减小体积

1. 简单图标形考虑 SVG
2. png 或 jpg 等位图尺寸尽量小，尽量使用无透明通道的图片
3. 打包的图片先进行无损压缩

对于图片格式,如果图形简单如果图标和 logo 等,尽量是用 svg 图片,体积小放大缩小不会不会模糊；如果图案复杂(通常压缩后的 svg > 10K)考虑用位图。

对于 png 或者 jpg, 等位图，根据使用的最大的尺寸`rpx`导出对应的图片(如 `20rpx` 导出 `20px` 图片)。

比如这两幅图片(都已经无损压缩过)

<img width="40rpx" src="https://avatars2.githubusercontent.com/u/6290356?s=400"/><img width="40rpx" src="https://avatars2.githubusercontent.com/u/6290356?s=80"/>

> 左图 16.4KB(尺寸 400px\*400px)
> 右图 4.6KB(尺寸 80px\*80px)
> 相差近 4 倍,对于图片内容越丰富的这种压缩差距越大。

减小尺寸不但可以降低文件体积，也能钱少图片渲染时的内存消耗。

对于图片进行无损压缩, SVG 可以使用 svgo 在线压缩 https://jakearchibald.github.io/svgomg/ ; PNG 可以在线压缩 https://tinypng.com/。

![](/assets/img/reduce-miniprogram-package-size/wechat.svg)

压缩前(3574B)

```html
<?xml version="1.0" encoding="UTF-8"?>
<svg
  width="81px"
  height="81px"
  viewBox="0 0 81 81"
  version="1.1"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
>
  <!-- Generator: Sketch 51.2 (57519) - http://www.bohemiancoding.com/sketch -->
  <title>微信</title>
  <desc>Created with Sketch.</desc>
  <defs></defs>
  <g id="v8" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
    <g
      id="Artboard-2-Copy-2"
      transform="translate(-83.000000, -1050.000000)"
      fill-rule="nonzero"
    >
      <g id="Group-7" transform="translate(83.000000, 1050.000000)">
        <g id="Group-3" transform="translate(0.600000, 0.500000)">
          <g id="微信">
            <path
              d="M40.0002681,5.08083974e-15 C17.9119219,5.08083974e-15 0,17.9039668 0,40.0002681 C0,62.0880781 17.9120113,80 40.0002681,80 C62.0960332,80 80,62.0960332 80,40.0002681 C80,17.9038774 62.0960332,0 40.0002681,5.08083974e-15 Z"
              id="Shape"
              fill="#4EB242"
            ></path>
            <path
              d="M49.9346481,32.2531143 C50.1790137,32.2531143 50.42293,32.2617696 50.6666667,32.270425 C49.3770994,25.3218777 42.15466,20 33.4335052,20 C23.806491,20 16,26.4899924 16,34.4853012 C16,39.166951 18.6749942,43.3376677 22.8392706,45.9858465 L22.995952,46.089443 L21.3146811,51.3333333 L27.6222769,48.1488799 C27.6222769,48.1488799 27.8229801,48.2095566 27.9184803,48.2355226 C29.6525773,48.7117451 31.508318,48.971227 33.4335052,48.971227 C33.825658,48.971227 34.2178108,48.9539163 34.6099636,48.9279503 C34.2527587,47.8292567 34.0520555,46.6692619 34.0520555,45.4750919 C34.0520555,38.1716754 41.1702801,32.2531143 49.9346481,32.2531143 Z M39.4976339,27.1477095 C40.8477536,27.1477095 41.9458712,28.2032155 41.9458712,29.5012497 C41.9458712,30.7992839 40.8476637,31.8547899 39.4976339,31.8547899 C38.1470651,31.8547899 37.0494864,30.7992839 37.0494864,29.5012497 C37.0495763,28.2032155 38.1470651,27.1477095 39.4976339,27.1477095 Z M27.3697359,31.8548791 C26.0196163,31.8548791 24.9214986,30.7993731 24.9214986,29.5013389 C24.9214986,28.2032155 26.0196163,27.1477987 27.3697359,27.1477987 C28.7203048,27.1477987 29.8178834,28.2033048 29.8178834,29.5013389 C29.8178834,30.7993731 28.7203048,31.8548791 27.3697359,31.8548791 Z"
              id="Shape"
              fill="#FFFFFF"
            ></path>
            <path
              d="M63.9999751,45.6558461 C63.9999751,38.8496451 57.432078,33.3333333 49.3375704,33.3333333 C41.2345637,33.3333333 34.6666667,38.8496451 34.6666667,45.6558461 C34.6666667,52.4619572 41.2345637,57.9783588 49.3375704,57.9783588 C50.9601757,57.9783588 52.5218562,57.7600823 53.9793113,57.3508476 C54.0658228,57.3334142 54.2308836,57.2810243 54.2308836,57.2810243 L59.5319729,60 L58.1175498,55.5383169 C58.1175498,55.5383169 58.2130972,55.4772103 58.2565766,55.4510602 C61.7527333,53.1937092 64.008653,49.6470081 63.9999751,45.6558461 Z M44.2363433,43.4247349 C43.0995265,43.4247349 42.1802857,42.5272761 42.1802857,41.4205271 C42.1802857,40.3135984 43.0995265,39.4160497 44.2363433,39.4160497 C45.3814802,39.4160497 46.3010788,40.3135085 46.3010788,41.4205271 C46.3010788,42.5272761 45.3728022,43.4247349 44.2363433,43.4247349 Z M54.4476544,43.4247349 C53.311285,43.4247349 52.3915969,42.5272761 52.3915969,41.4205271 C52.3915969,40.3135984 53.311285,39.4160497 54.4476544,39.4160497 C55.5845607,39.4160497 56.503712,40.3135085 56.51239,41.4205271 C56.51239,42.5272761 55.5845607,43.4247349 54.4476544,43.4247349 Z"
              id="Shape"
              fill="#FFFFFF"
            ></path>
          </g>
        </g>
      </g>
    </g>
  </g>
</svg>
```

压缩后(1310B)

```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 81 81">
  <path
    fill="#4EB242"
    d="M40.6.5C18.512.5.6 18.404.6 40.5c0 22.088 17.912 40 40 40 22.096 0 40-17.904 40-40S62.696.5 40.6.5z"
  />
  <path
    fill="#FFF"
    d="M50.535 32.753c.244 0 .488.009.732.017-1.29-6.948-8.512-12.27-17.233-12.27-9.628 0-17.434 6.49-17.434 14.485 0 4.682 2.675 8.853 6.84 11.5l.156.104-1.681 5.244 6.307-3.184.296.087c1.735.476 3.59.735 5.516.735.392 0 .784-.017 1.176-.043a11.154 11.154 0 01-.558-3.453c0-7.303 7.118-13.222 15.883-13.222zm-10.437-5.105c1.35 0 2.448 1.055 2.448 2.353 0 1.298-1.098 2.354-2.448 2.354-1.35 0-2.449-1.056-2.449-2.354s1.098-2.353 2.449-2.353zM27.97 32.355c-1.35 0-2.449-1.056-2.449-2.354s1.099-2.353 2.449-2.353c1.35 0 2.448 1.055 2.448 2.353 0 1.298-1.098 2.354-2.448 2.354z"
  />
  <path
    fill="#FFF"
    d="M64.6 46.156c0-6.806-6.568-12.323-14.662-12.323-8.103 0-14.671 5.517-14.671 12.323s6.568 12.322 14.67 12.322c1.623 0 3.185-.218 4.642-.627.087-.018.252-.07.252-.07l5.301 2.719-1.414-4.462.139-.087c3.496-2.257 5.752-5.804 5.743-9.795zm-19.764-2.231c-1.136 0-2.056-.898-2.056-2.004 0-1.107.92-2.005 2.056-2.005 1.145 0 2.065.898 2.065 2.005 0 1.106-.928 2.004-2.065 2.004zm10.212 0c-1.137 0-2.056-.898-2.056-2.004 0-1.107.92-2.005 2.056-2.005 1.137 0 2.056.898 2.064 2.005 0 1.106-.927 2.004-2.064 2.004z"
  />
</svg>
```

> 在 [miniprorgam-build](https://github.com/NewFuture/miniprogram-build) 中内置了图片资源文件无损压缩功能, 在编译过程中自动压缩 svg,jpg 和 png。

## npm 包

npm 依赖如果管理不好, 也可能会导致包体积增大。

### 合理选择 npm

很多 npm 包 为了引入较多依赖和运行时以兼容浏览器，nodejs，小程序等不同环境。小程序专供版会比适配版更合适。

比如使用[axios](https://www.npmjs.com/package/axios)(前端和服务器端常用的 js 请求库),会带来一些不必要的依赖和运行时。

### 使用相同版本的依赖

可以是用`npm ls`查看依赖关系,保证每个包都是一个版本的。

如果出现多个版本，小程序开发工具会打包成多个版本。多个版本，同样会增大体积。(注意:还有可能造成潜在的风险，多个版本之间变量和配置是分离的，修改了一个版本模块的设置，对其他依赖项可能不起作用)

### 包合并和 tree-shaking

> 举个例子 🌰
> 我们安装一个处理 query 参数的包[query-string](https://www.npmjs.com/package/query-string)的包。

微信开发者工具构建 npm 的结果(忽略.map 文件,这部分不影响打包体积和加载性能)
根据包的依赖关系会生成四个合并完整的包，压缩后总体积 **8.32KB**

> - npm install query-string@6.8.3
> - 开发工具为 Stable V1.0.2

```
miniprogram_npm
  ├─decode-uri-component
  |    └──────index.js --> compress => 2.21KB
  ├─query-string
  |    └──────index.js --> compress => 4.27KB
  ├─split-on-first
  |    └──────index.js --> compress => 1.02KB
  └─strict-uri-encode
       └──────index.js --> compress => 0.82KB
```

如果压缩到一个包并,进行 [tree-shaking](https://developer.mozilla.org/zh-CN/docs/Glossary/Tree_shaking) 优化。然后压缩后总体积 **4.41KB**。

```
miniprogram_npm
  └─query-string
      └──────index.js --> compress => 4.41KB
```

两者相差近一般，而实际上由于单模块并移除了 dead code 后者运行时的性能会更好。

> 对于小程序网络库的包 [miniprogram-network](https://github.com/NewFuture/miniprogram-network)
> 两者的打包结果同样有显著差异

### npm 小结

- **对于有大量依赖关系复杂的包，需要慎重处理包的 npm 和其依赖关系**
- **npm 包的 dependencies 依赖树上每个包保证只有一个版本存在**
- **对于依赖较多的 npm 包，优先使用支持合并和 tree-shaking 的工具生成 npm 依赖，如[miniprogram-build](https://github.com/NewFuture/miniprogram-build)**

## 样式文件

样式文件在项目迭代过程中变得十分庞大和臃肿。
样式文件太大不但影响包的体积和下载速度，更影响渲染效率和内存占用。

> 小程序里不支持`background`引用本地文件也不知页面的 svg，因此内联的背景图作为图标成了最佳方式。编码方式和图片处理不当也会造成体 wxss 体积增大。

### 公有样式提取

对于全局公有样式，比如图标(icon),按钮(button)等,全局共用性的样式或者动画可以写入全局的`app.wxss`。
对于特定页面和组件共用的样式可以写入一个单独的 wxss 然后通过`@import "/path/to/style.wxss"`的方式导入样式文件。(小程序不同于 web,样式文件都本地,import 的性能影响可以忽略)

### 压缩内联图片

内联背景图有助于提高图标的渲染性能，在小程序中经常使用(`image`标签的图标在渲染的时候可能出现闪现的空白，渲染性能不如背景图)。
但是如果未做好优化体积影响会很大。

如下面的微信图标

- 未压缩 base64 (**5337 B**)

```css
.wechat {
  background-image: url("data:img/jpg;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjxzdmcNCiAgICB3aWR0aD0iODFweCINCiAgICBoZWlnaHQ9IjgxcHgiDQogICAgdmlld0JveD0iMCAwIDgxIDgxIg0KICAgIHZlcnNpb249IjEuMSINCiAgICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciDQogICAgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiDQo+DQogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCA1MS4yICg1NzUxOSkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+DQogICAgPHRpdGxlPuW+ruS/oTwvdGl0bGU+DQogICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+DQogICAgPGcgaWQ9InY4IiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4NCiAgICAgICAgPGcNCiAgICAgICAgICAgIGlkPSJBcnRib2FyZC0yLUNvcHktMiINCiAgICAgICAgICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKC04My4wMDAwMDAsIC0xMDUwLjAwMDAwMCkiDQogICAgICAgICAgICBmaWxsLXJ1bGU9Im5vbnplcm8iDQogICAgICAgID4NCiAgICAgICAgICAgIDxnIGlkPSJHcm91cC03IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg4My4wMDAwMDAsIDEwNTAuMDAwMDAwKSI+DQogICAgICAgICAgICAgICAgPGcgaWQ9Ikdyb3VwLTMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAuNjAwMDAwLCAwLjUwMDAwMCkiPg0KICAgICAgICAgICAgICAgICAgICA8ZyBpZD0i5b6u5L+hIj4NCiAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoDQogICAgICAgICAgICAgICAgICAgICAgICAgICAgZD0iTTQwLjAwMDI2ODEsNS4wODA4Mzk3NGUtMTUgQzE3LjkxMTkyMTksNS4wODA4Mzk3NGUtMTUgMCwxNy45MDM5NjY4IDAsNDAuMDAwMjY4MSBDMCw2Mi4wODgwNzgxIDE3LjkxMjAxMTMsODAgNDAuMDAwMjY4MSw4MCBDNjIuMDk2MDMzMiw4MCA4MCw2Mi4wOTYwMzMyIDgwLDQwLjAwMDI2ODEgQzgwLDE3LjkwMzg3NzQgNjIuMDk2MDMzMiwwIDQwLjAwMDI2ODEsNS4wODA4Mzk3NGUtMTUgWiINCiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZD0iU2hhcGUiDQogICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsbD0iIzRFQjI0MiINCiAgICAgICAgICAgICAgICAgICAgICAgID48L3BhdGg+DQogICAgICAgICAgICAgICAgICAgICAgICA8cGF0aA0KICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQ9Ik00OS45MzQ2NDgxLDMyLjI1MzExNDMgQzUwLjE3OTAxMzcsMzIuMjUzMTE0MyA1MC40MjI5MywzMi4yNjE3Njk2IDUwLjY2NjY2NjcsMzIuMjcwNDI1IEM0OS4zNzcwOTk0LDI1LjMyMTg3NzcgNDIuMTU0NjYsMjAgMzMuNDMzNTA1MiwyMCBDMjMuODA2NDkxLDIwIDE2LDI2LjQ4OTk5MjQgMTYsMzQuNDg1MzAxMiBDMTYsMzkuMTY2OTUxIDE4LjY3NDk5NDIsNDMuMzM3NjY3NyAyMi44MzkyNzA2LDQ1Ljk4NTg0NjUgTDIyLjk5NTk1Miw0Ni4wODk0NDMgTDIxLjMxNDY4MTEsNTEuMzMzMzMzMyBMMjcuNjIyMjc2OSw0OC4xNDg4Nzk5IEMyNy42MjIyNzY5LDQ4LjE0ODg3OTkgMjcuODIyOTgwMSw0OC4yMDk1NTY2IDI3LjkxODQ4MDMsNDguMjM1NTIyNiBDMjkuNjUyNTc3Myw0OC43MTE3NDUxIDMxLjUwODMxOCw0OC45NzEyMjcgMzMuNDMzNTA1Miw0OC45NzEyMjcgQzMzLjgyNTY1OCw0OC45NzEyMjcgMzQuMjE3ODEwOCw0OC45NTM5MTYzIDM0LjYwOTk2MzYsNDguOTI3OTUwMyBDMzQuMjUyNzU4Nyw0Ny44MjkyNTY3IDM0LjA1MjA1NTUsNDYuNjY5MjYxOSAzNC4wNTIwNTU1LDQ1LjQ3NTA5MTkgQzM0LjA1MjA1NTUsMzguMTcxNjc1NCA0MS4xNzAyODAxLDMyLjI1MzExNDMgNDkuOTM0NjQ4MSwzMi4yNTMxMTQzIFogTTM5LjQ5NzYzMzksMjcuMTQ3NzA5NSBDNDAuODQ3NzUzNiwyNy4xNDc3MDk1IDQxLjk0NTg3MTIsMjguMjAzMjE1NSA0MS45NDU4NzEyLDI5LjUwMTI0OTcgQzQxLjk0NTg3MTIsMzAuNzk5MjgzOSA0MC44NDc2NjM3LDMxLjg1NDc4OTkgMzkuNDk3NjMzOSwzMS44NTQ3ODk5IEMzOC4xNDcwNjUxLDMxLjg1NDc4OTkgMzcuMDQ5NDg2NCwzMC43OTkyODM5IDM3LjA0OTQ4NjQsMjkuNTAxMjQ5NyBDMzcuMDQ5NTc2MywyOC4yMDMyMTU1IDM4LjE0NzA2NTEsMjcuMTQ3NzA5NSAzOS40OTc2MzM5LDI3LjE0NzcwOTUgWiBNMjcuMzY5NzM1OSwzMS44NTQ4NzkxIEMyNi4wMTk2MTYzLDMxLjg1NDg3OTEgMjQuOTIxNDk4NiwzMC43OTkzNzMxIDI0LjkyMTQ5ODYsMjkuNTAxMzM4OSBDMjQuOTIxNDk4NiwyOC4yMDMyMTU1IDI2LjAxOTYxNjMsMjcuMTQ3Nzk4NyAyNy4zNjk3MzU5LDI3LjE0Nzc5ODcgQzI4LjcyMDMwNDgsMjcuMTQ3Nzk4NyAyOS44MTc4ODM0LDI4LjIwMzMwNDggMjkuODE3ODgzNCwyOS41MDEzMzg5IEMyOS44MTc4ODM0LDMwLjc5OTM3MzEgMjguNzIwMzA0OCwzMS44NTQ4NzkxIDI3LjM2OTczNTksMzEuODU0ODc5MSBaIg0KICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkPSJTaGFwZSINCiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxsPSIjRkZGRkZGIg0KICAgICAgICAgICAgICAgICAgICAgICAgPjwvcGF0aD4NCiAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoDQogICAgICAgICAgICAgICAgICAgICAgICAgICAgZD0iTTYzLjk5OTk3NTEsNDUuNjU1ODQ2MSBDNjMuOTk5OTc1MSwzOC44NDk2NDUxIDU3LjQzMjA3OCwzMy4zMzMzMzMzIDQ5LjMzNzU3MDQsMzMuMzMzMzMzMyBDNDEuMjM0NTYzNywzMy4zMzMzMzMzIDM0LjY2NjY2NjcsMzguODQ5NjQ1MSAzNC42NjY2NjY3LDQ1LjY1NTg0NjEgQzM0LjY2NjY2NjcsNTIuNDYxOTU3MiA0MS4yMzQ1NjM3LDU3Ljk3ODM1ODggNDkuMzM3NTcwNCw1Ny45NzgzNTg4IEM1MC45NjAxNzU3LDU3Ljk3ODM1ODggNTIuNTIxODU2Miw1Ny43NjAwODIzIDUzLjk3OTMxMTMsNTcuMzUwODQ3NiBDNTQuMDY1ODIyOCw1Ny4zMzM0MTQyIDU0LjIzMDg4MzYsNTcuMjgxMDI0MyA1NC4yMzA4ODM2LDU3LjI4MTAyNDMgTDU5LjUzMTk3MjksNjAgTDU4LjExNzU0OTgsNTUuNTM4MzE2OSBDNTguMTE3NTQ5OCw1NS41MzgzMTY5IDU4LjIxMzA5NzIsNTUuNDc3MjEwMyA1OC4yNTY1NzY2LDU1LjQ1MTA2MDIgQzYxLjc1MjczMzMsNTMuMTkzNzA5MiA2NC4wMDg2NTMsNDkuNjQ3MDA4MSA2My45OTk5NzUxLDQ1LjY1NTg0NjEgWiBNNDQuMjM2MzQzMyw0My40MjQ3MzQ5IEM0My4wOTk1MjY1LDQzLjQyNDczNDkgNDIuMTgwMjg1Nyw0Mi41MjcyNzYxIDQyLjE4MDI4NTcsNDEuNDIwNTI3MSBDNDIuMTgwMjg1Nyw0MC4zMTM1OTg0IDQzLjA5OTUyNjUsMzkuNDE2MDQ5NyA0NC4yMzYzNDMzLDM5LjQxNjA0OTcgQzQ1LjM4MTQ4MDIsMzkuNDE2MDQ5NyA0Ni4zMDEwNzg4LDQwLjMxMzUwODUgNDYuMzAxMDc4OCw0MS40MjA1MjcxIEM0Ni4zMDEwNzg4LDQyLjUyNzI3NjEgNDUuMzcyODAyMiw0My40MjQ3MzQ5IDQ0LjIzNjM0MzMsNDMuNDI0NzM0OSBaIE01NC40NDc2NTQ0LDQzLjQyNDczNDkgQzUzLjMxMTI4NSw0My40MjQ3MzQ5IDUyLjM5MTU5NjksNDIuNTI3Mjc2MSA1Mi4zOTE1OTY5LDQxLjQyMDUyNzEgQzUyLjM5MTU5NjksNDAuMzEzNTk4NCA1My4zMTEyODUsMzkuNDE2MDQ5NyA1NC40NDc2NTQ0LDM5LjQxNjA0OTcgQzU1LjU4NDU2MDcsMzkuNDE2MDQ5NyA1Ni41MDM3MTIsNDAuMzEzNTA4NSA1Ni41MTIzOSw0MS40MjA1MjcxIEM1Ni41MTIzOSw0Mi41MjcyNzYxIDU1LjU4NDU2MDcsNDMuNDI0NzM0OSA1NC40NDc2NTQ0LDQzLjQyNDczNDkgWiINCiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZD0iU2hhcGUiDQogICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsbD0iI0ZGRkZGRiINCiAgICAgICAgICAgICAgICAgICAgICAgID48L3BhdGg+DQogICAgICAgICAgICAgICAgICAgIDwvZz4NCiAgICAgICAgICAgICAgICA8L2c+DQogICAgICAgICAgICA8L2c+DQogICAgICAgIDwvZz4NCiAgICA8L2c+DQo8L3N2Zz4NCg==");
}
```

- 压缩后的 Base64 (**1788 B**)

```css
.wechat {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDgxIDgxIj48cGF0aCBmaWxsPSIjNEVCMjQyIiBkPSJNNDAuNi41QzE4LjUxMi41LjYgMTguNDA0LjYgNDAuNWMwIDIyLjA4OCAxNy45MTIgNDAgNDAgNDAgMjIuMDk2IDAgNDAtMTcuOTA0IDQwLTQwUzYyLjY5Ni41IDQwLjYuNXoiLz48cGF0aCBmaWxsPSIjRkZGIiBkPSJNNTAuNTM1IDMyLjc1M2MuMjQ0IDAgLjQ4OC4wMDkuNzMyLjAxNy0xLjI5LTYuOTQ4LTguNTEyLTEyLjI3LTE3LjIzMy0xMi4yNy05LjYyOCAwLTE3LjQzNCA2LjQ5LTE3LjQzNCAxNC40ODUgMCA0LjY4MiAyLjY3NSA4Ljg1MyA2Ljg0IDExLjVsLjE1Ni4xMDQtMS42ODEgNS4yNDQgNi4zMDctMy4xODQuMjk2LjA4N2MxLjczNS40NzYgMy41OS43MzUgNS41MTYuNzM1LjM5MiAwIC43ODQtLjAxNyAxLjE3Ni0uMDQzYTExLjE1NCAxMS4xNTQgMCAwMS0uNTU4LTMuNDUzYzAtNy4zMDMgNy4xMTgtMTMuMjIyIDE1Ljg4My0xMy4yMjJ6bS0xMC40MzctNS4xMDVjMS4zNSAwIDIuNDQ4IDEuMDU1IDIuNDQ4IDIuMzUzIDAgMS4yOTgtMS4wOTggMi4zNTQtMi40NDggMi4zNTQtMS4zNSAwLTIuNDQ5LTEuMDU2LTIuNDQ5LTIuMzU0czEuMDk4LTIuMzUzIDIuNDQ5LTIuMzUzek0yNy45NyAzMi4zNTVjLTEuMzUgMC0yLjQ0OS0xLjA1Ni0yLjQ0OS0yLjM1NHMxLjA5OS0yLjM1MyAyLjQ0OS0yLjM1M2MxLjM1IDAgMi40NDggMS4wNTUgMi40NDggMi4zNTMgMCAxLjI5OC0xLjA5OCAyLjM1NC0yLjQ0OCAyLjM1NHoiLz48cGF0aCBmaWxsPSIjRkZGIiBkPSJNNjQuNiA0Ni4xNTZjMC02LjgwNi02LjU2OC0xMi4zMjMtMTQuNjYyLTEyLjMyMy04LjEwMyAwLTE0LjY3MSA1LjUxNy0xNC42NzEgMTIuMzIzczYuNTY4IDEyLjMyMiAxNC42NyAxMi4zMjJjMS42MjMgMCAzLjE4NS0uMjE4IDQuNjQyLS42MjcuMDg3LS4wMTguMjUyLS4wNy4yNTItLjA3bDUuMzAxIDIuNzE5LTEuNDE0LTQuNDYyLjEzOS0uMDg3YzMuNDk2LTIuMjU3IDUuNzUyLTUuODA0IDUuNzQzLTkuNzk1em0tMTkuNzY0LTIuMjMxYy0xLjEzNiAwLTIuMDU2LS44OTgtMi4wNTYtMi4wMDQgMC0xLjEwNy45Mi0yLjAwNSAyLjA1Ni0yLjAwNSAxLjE0NSAwIDIuMDY1Ljg5OCAyLjA2NSAyLjAwNSAwIDEuMTA2LS45MjggMi4wMDQtMi4wNjUgMi4wMDR6bTEwLjIxMiAwYy0xLjEzNyAwLTIuMDU2LS44OTgtMi4wNTYtMi4wMDQgMC0xLjEwNy45Mi0yLjAwNSAyLjA1Ni0yLjAwNSAxLjEzNyAwIDIuMDU2Ljg5OCAyLjA2NCAyLjAwNSAwIDEuMTA2LS45MjcgMi4wMDQtMi4wNjQgMi4wMDR6Ii8+PC9zdmc+");
}
```

- 压缩后 Data URL Encode (**1348 B**)

```css
.wechat {
  background-image: url("data:image/svg+xml;charset=UTF-8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 81 81'><path fill='%234EB242' d='M40.6.5C18.512.5.6 18.404.6 40.5c0 22.088 17.912 40 40 40 22.096 0 40-17.904 40-40S62.696.5 40.6.5z'/><path fill='%23FFF' d='M50.535 32.753c.244 0 .488.009.732.017-1.29-6.948-8.512-12.27-17.233-12.27-9.628 0-17.434 6.49-17.434 14.485 0 4.682 2.675 8.853 6.84 11.5l.156.104-1.681 5.244 6.307-3.184.296.087c1.735.476 3.59.735 5.516.735.392 0 .784-.017 1.176-.043a11.154 11.154 0 01-.558-3.453c0-7.303 7.118-13.222 15.883-13.222zm-10.437-5.105c1.35 0 2.448 1.055 2.448 2.353 0 1.298-1.098 2.354-2.448 2.354-1.35 0-2.449-1.056-2.449-2.354s1.098-2.353 2.449-2.353zM27.97 32.355c-1.35 0-2.449-1.056-2.449-2.354s1.099-2.353 2.449-2.353c1.35 0 2.448 1.055 2.448 2.353 0 1.298-1.098 2.354-2.448 2.354z'/><path fill='%23FFF' d='M64.6 46.156c0-6.806-6.568-12.323-14.662-12.323-8.103 0-14.671 5.517-14.671 12.323s6.568 12.322 14.67 12.322c1.623 0 3.185-.218 4.642-.627.087-.018.252-.07.252-.07l5.301 2.719-1.414-4.462.139-.087c3.496-2.257 5.752-5.804 5.743-9.795zm-19.764-2.231c-1.136 0-2.056-.898-2.056-2.004 0-1.107.92-2.005 2.056-2.005 1.145 0 2.065.898 2.065 2.005 0 1.106-.928 2.004-2.065 2.004zm10.212 0c-1.137 0-2.056-.898-2.056-2.004 0-1.107.92-2.005 2.056-2.005 1.137 0 2.056.898 2.064 2.005 0 1.106-.927 2.004-2.064 2.004z'/></svg>");
}
```

这个例子中压缩和未压缩的体积差接约 3/4，utf8 编码和 base64 编码体积差约 1/4。

1. 图片先压缩再编码
2. svg 图片使用 utf8 编码代替 base64

### css 激进压缩

虽然再小程序上传的时候，开发工具可以自动的压缩 CSS 文件。
但是这个压缩是保守的压缩。如果开启属性重写等低风险的激进(aggressive)压缩方式(有风险但对于标准的使用方式几乎不会出现问题),压缩会对大文件的样式有可观的压缩效果。

实际对于内联样式的压缩编码和 wxss 文件的激进压缩,这些操作通过构建工具自动的处理。

## 自动化处理

使用 `miniprogram-build` 进行编译项目时，大部分琐碎的优化工作会自动进行。

- [x] 图片压缩
- [x] npm 合并, tree-shaking 和版本合并
- [x] 压缩 css 内联背景图压缩和自动编码
- [x] 样式文件压缩

需要手动维护的是

- 删除无用的资源文件
- 及时更新和是的 npm
- 合理分配样式文件

## 实际应用

将一个 2MB 的小程序优化到 620KB,下载时间从 接近2.4s 下降到 0.8s左右。

![](/assets/img/reduce-miniprogram-package-size/download-time.jpg)

---
layout: post
title: How to mock in jest test (advanced)
subtitle: 测试进阶
private: true
tags:
    - test
---

## summary

| 类型           | 作用范围               | 场景                     |
| -------------- | ---------------------- | ------------------------ |
| module mapper  | Global                 | 解决编译问题             |
| tansform       | Global                 | 转换某一类型文件         |
| `__mocks__`    | test files             | 替换单个包或模块         |
| `jest.mock`    | code block/test files  | 动态替换某个模块         |
| `jest.spyon()` | code block             | 局部替换某个函数实现     |
| `jest.fn()`    | create a mock function | 生成一个 mock 函数       |
| mock provider  | test case              | 第三方包实现的 mock 功能 |

### 原则

> 1. 能避免的 mock 的尽量避免 mock (减少 mock 维护成本，测试越接近真实场景)
> 2. 第三方库，优先考虑自带的 mock 实现 (同上)
> 3. mock 范围和内容尽量小，并及时清理 (减少副作用)
> 4. 公用的 mock 在 setup 中初始化 (维护一份数据)

## Global Module Mapper

通常用来替换在 Jest 测试中不能正常解析或者导入的内容,通常可能导致测试代码不能正常编译的场景:

-   图片等资源文件
-   导出格式不兼容(ES Module) 转 CommonJS
-   其他可替换的内容

### 资源文件

在代码引入了一些非 JS 的内容，直接 test 会报无法解析的错误

```ts
// App.tsx
import logo from "./assets/logo.png";
```

在 Jest 配置文件中

```ts
// jest.config.ts
import type { Config } from "jest";
const config: Config = {
    moduleNameMapper: {
        // 替换 png 为 RelativeImageStub文件，当成js 文件导入
        "^[./a-zA-Z0-9$_-]+\\.png$": "<rootDir>/RelativeImageStub.js",
    },
};

export default config;
```

### ES Module 转 Commonjs Module

对于兼容 ESM 和 CommonJS 的包,直接导入包名,jest 会自动使用 Commonjs 版本

> 截至到最新的 Jest 29 [ES Module 的支持](https://jestjs.io/docs/ecmascript-modules)正处于试验阶段

对于只有 ESM 的可以 在 Jest 配置映射成对应的 CommonJS module

```ts
// jest.config.ts
moudle.exports = {
    moduleNameMapper: {
        // "import lodash-es"(ES Module) 替换成 "lodash"(common js module)
        "^lodash-es$": "lodash",
    },
};
```

### 替代自定义包

对于一下有兼容性问题的包,也可以使用类似方式

```ts
// jest.config.ts
const config: Config = {
    moduleNameMapper: {
        "deps-pack-name": "<rootDir>/pack-local-mock.js",
    },
};
```

[更多关于 module mapper](https://jestjs.io/docs/configuration#modulenamemapper-objectstring-string--arraystring)

## 自定义 Transform

Transform 相当于自定义编译方式, 比如 Typescript 都是通过 `transform` 转换成 js 的. (绝大数情况下,不需要手写 transform)

JEST 处理文件流程

> jest (import file) --> mapper --> transform --> js

![jest process flow](https://www.plantuml.com/plantuml/png/NP0n4i8m30Hxlq9Td08_81GKbBp2E38n4-HWoKL-Znqo8Q7JdFPqccEnIPJg4hvpIAWR7qPishDImOCUB8C5IPROn_Iwj2034kWPkLs0ROK9Aln0kLetu0td8zpjIBEZj36cfE7829fY0NEPdiW2znn6EGKgM-g3_tuK25or_bslfaK75qcGv71odpsbw91vpUtor5jPlLlGpxeAMpsrcA9z0000)

配置转义

```js
exports = {
    transform: {
        "\\.(jpg|jpeg|png|gif)$": "<rootDir>/fileTransformer.js",
    },
};
```

定义 Transformer

```js
// fileTransformer.js
const path = require("path");
exports = {
    process(sourceText, sourcePath, options) {
        return {
            code: `module.exports = ${JSON.stringify(path.basename(sourcePath))};`,
        };
    },
};
```

编译

```ts
import logo from "./assets/logo.png";
// logo.png 的内容被替换为 `module.exports = "logo.png";`
// 在测试的编译结果 logo = "logo.png"
```

[更多自定义 Transform](https://jestjs.io/docs/code-transformation)

## `__mocks__` module

-   项目根录(jest.config 中配置) 下的 **mocks** 文件可以自动替换 npm 包
-   任何

### root 目录下自动 mock node_modules

如`<rootDir>/__mocks__/lodash.js` 会自动替换 node_modules 里的`lodash` 包

### 项目文件,同名目录下，调用 jest.mock 后会自动替换

`jest.mock('./path/local/file')`会自动使用 `./path/local/__mocks__/file.ts` 替换

> 可以在 setup 文件导入 mock, 在所有测试中自动替换

```
.
├── config
├── __mocks__
│   └── fs.js // 自动 替换 import('fs')
├── models
│   ├── __mocks__
│   │   └── user.js // 当 jest.mock('./models/user') 会自动替换 user.js
│   └── user.js
├── node_modules
└── views
```

`jest.requireActual` 可以调用 mock 之前的原始 module

[more docs about manual mocks](https://jestjs.io/docs/manual-mocks)

## `jest.mock`

```js
jest.mock("@microsoft/teams-js", () => {
    return {
        getAuthToken: () => Promise.resovle("mock-token"),
        initialize: () => Promise.resovle(),
    };
});
```

## `jest.spyOn`

[jest.spyOn](https://jestjs.io/docs/jest-object#jestspyonobject-methodname) replace a method of a module or object

```ts
import * as msTeams from "@microsoft/teams-js";
jest.spyOn(msTeams, "getAuthToken").mockImplementation(() => resovle("spy-token"));

// 调用 msTeams.getAuthToken 会返回
await msTeams.getAuthToken(); // spy-token
```

## `jest.fn`

[jest.fn 创建一个mock 函数用于测试](https://jestjs.io/docs/mock-function-api)

与`jest.mock`和`jest.spyOn`不同,`jest.fn`用来生成一个`函数`用来测试。

* mock 或者 spyOn的实现
* 测试回调函数的调用

### mock 实现

```ts
import * as msTeams from "@microsoft/teams-js";
const authFn = jest.fn(() => resovle("fn-token"));
jest.spyOn(msTeams, "getAuthToken").mockImplementation(authFn);
```

### 测试回调

```ts
import { incCallback } from "../src/com/incCallback";

test("test incCallback", () => {
    const f = jest.fn((n: number) => n);
    const action = incCallback(f);

    expect(action()).toBe(0);
    expect(f).toBeCalledWith(0); // 检查函数调用参数
})
```

## `mock provider`

一些较为复杂的第三方库如 `@apollo/client`,提供了`MockedProvider`替换测试内容

```tsx
import { MockedProvider } from '@apollo/client/testing';
rend(<MockedProvider mocks={[]}>content detail</MockedProvider>)
```

---
layout: post
title: How to write tests
subtitle: 前端测试
private: true
# feature-img:
tags:
    - FE
    - test
    - jest
---

0. Javascript Framework
1. how to test a function
1. how to test an async function
1. how to test a hook
1. how to test a component (render)
1. how to test a component (snapshot)
1. how to test an APP

## JavaScript/TypeScript Framework

1. **用 jest <https://github.com/facebook/jest>**
2. `yarn jest` 运行所有测试

<details>

## JS 基础测试框架对比 https://npmtrends.com/jasmine-vs-jest-vs-mocha

1. [Jest](https://jestjs.io/)
    > Jest is a delightful JavaScript Testing Framework with a focus on simplicity.
    > It works with projects using: Babel, TypeScript, Node, React, Angular, Vue and more!
2. [Mocha](https://mochajs.org/)
    > Mocha is a feature-rich JavaScript test framework running on Node.js and in the browser, making asynchronous testing simple and fun.
    > Mocha tests run serially, allowing for flexible and accurate reporting, while mapping uncaught exceptions to the correct test cases.
3. [Jasmine](https://jasmine.github.io/)
    > Behavior-Driven JavaScript.
    > Low overhead, jasmine-core has no external dependencies.
    </details>

## Test a basic Function

对于给定输入判断输出，以测试 `stringify` 为例

```ts
// stringify.test.js

describe("JSON.stringify basic type", () => {
    //describe：创造一个块，将一组相关的测试用例组合在一起
    it("works with boolean", () => {
        // it: 测试用例  (test 别名)
        const result = JSON.stringify(true);
        expect(result).toBe("true"); // expect：断言某个值，条件(matcher)不成立则测试不通过
        expect(result).not.toBe(true); // not: 否定判断
    });

    // ... 多组 it
});
```

<details>

## 内置 matcher

1. 通用 Common Matchers
    - `toBe` 完全相等 (exact equality).
    - **`toEqual` 值相等** (recursively checks every field of an object or array)
2. 真值 Truthiness
    - `toBeTruthy` 等效 `value == true` (matches anything that treats as true)
    - `toBeFalsy` 等效 `value == true` (anything that treats as false)
    - `toBeNull` 等效 `value === null`
    - `toBeUndefined` 等效 `value === undefined`
    - `toBeDefined` 非`undefined` (`not.toBeUndefined`)
3. 数字 Numbers
    - **`toBeCloseTo` 浮点数相等**(避免精度导致的随机错误)
    - `toEqual` 等于
    - `toBeGreaterThan` 大于`>`
    - `toBeGreaterThanOrEqual` 大于等于
    - `toBeLessThan` 小于
    - `toBeLessThanOrEqual` 小于等于
4. 字符串 Strings
    - `toMatch` 正则匹配:
5. 数组 Arrays and iterables
    - `toContain` 包含
6. 异常/错误 Exceptions
    - `expect(funcThrowErrors()).toThrow()` 抛错
    - `toThrow(Error)` 抛出指定类型错误
    - `toThrow('you are using the wrong JDK')` 包含特定 error message
    - Note: the function that throws an exception needs to be invoked within a wrapping function otherwise the toThrow assertion will fail.

全部 API <https://jestjs.io/docs/expect>

</details>

## Test an Asynchronous Function

对于给定输入判断输出，以测试 `stringify` 为例

```ts
// stringify.test.ts

//describe：创造一个块，将一组相关的测试用例组合在一起
describe("JSON.stringify basic type", () => {
    // it/test: 测试用例  (test 别名)
    test("works with boolean", () => {
        const result = JSON.stringify(true);
        expect(result).toBe("true"); // expect：断言某个值，条件(matcher)不成立则测试不通过
        expect(result).not.toBe(true); // not: 否定判断
    });

    // ... 多组 it
});
```

## Test an async function

1. 优先使用 Async/Await 函数
2. 使用 `.resolves`/`.rejects` 判断 Promise
3. 非 promise(事件触发)考虑 callback 回调方式

### async 函数

```ts
test("the data is ok", async () => {
    expect.assertions(1); // assertions 会确保断言数量
    const data = await fetchData();
    expect(data).toBe("ok");
});
```

### expect(promise) 断言

```ts
test("the fetch fails with an error", async () => {
    await expect(fetchData()).rejects.toMatch("error"); // 必须 await,否则测试会提前结束
});
```

### callback 参数回调

```ts
test("the data is ok", (done) => {
    // 调研 done 结束测试
    fetchData((error, data) => {
        if (error) {
            done(error); // 测试失败
        } else {
            try {
                expect(data).toBe("ok");
                done(); // 测试成功
            } catch (error) {
                done(error); // 测试失败, 此处try catch，否则 expect失败后会超时错误
            }
        }
    });
});
```

<details open>

jest 测试异步函数支持两种方式

-   传统的异步参数回调: `it('callback',(done:(err?:any)=>void)=>{})`l
-   返回一个 Promise (async/await 是一种特殊的 Promise 写法): `it('promise',():Prmose<any>=>{})`;

> **切记 Promise 和 callback 不可混用**
>
> **避免使用 catch 判断**，必须使用时一定要用 `expect.assertions` (考虑用 rejects 替代)

```ts
// × 错误写法
test("the fetch fails with an error", () => {
    // 无论fetchData 是否成功，都会测试正常完成
    return fetchData().catch((e) => expect(e).toMatch("error"));
});

// √ 正确写法
test("the fetch fails with an error", () => {
    expect.assertions(1); // 确保 expect调用一次
    return fetchData().catch((e) => expect(e).toMatch("error"));
});
```

参考 jest 异步测试 <https://jestjs.io/docs/asynchronous>

</details>

## Test a React Hook

> hooks 是一种特殊的组件

1. use `@testing-library/react` to `renderHook`
2. `rerender` for props changed

### test a hook result

```ts
import { renderHook } from "@testing-library/react";
// import { renderHook } from '@testing-library/react-hooks' // old version

/**
 * a hook
 */
const useTestHook = () => {
    const [name, setName] = React.useState("");
    React.useEffect(() => setName("Test"), []);
    return name;
};

test("render useTestHook", () => {
    const { result } = renderHook(useTestHook); // renderHook 返回值中 result 指向返回值的ref
    expect(result.current).toBe("Test"); // result.current 为当前值
});
```

### test with rerender

```ts
const useTestProps = (value) => {
    const [name, setName] = React.useState("");
    React.useEffect(() => setName((n) => `${n} ${value}`), [value]);
    return name;
};
test("returns useTestProps", () => {
    const { result, rerender } = renderHook(useTestProps, {
        initialProps: "Test", // provide init render value
    });
    expect(result.current).toBe(" Test");
    rerender("NewValue"); // rerender with new value
    expect(result.current).toEqual(" Test NewValue");
});
```

### test with async hook update

-   React Testing Library (version >= 13)

```ts
import React from "react";
import { act, waitFor, renderHook } from "@testing-library/react"; // React Testing Library Version>= 13.0

const useTestPromise = () => {
    const [name, setName] = React.useState("");
    return {
        name,
        updateAsyc: (v) => {
            Promise.resolve().then(() => setName(v));
        },
    };
};

test("returns useTestPromise", async () => {
    // async 异步函数
    const { result } = renderHook(useTestPromise);
    expect(result.current.name).toBe(""); // 检查初始值

    // act 包裹异步状态更新，否则可能状态无法更新或者react warning
    await act(async () => {
        result.current.updateAsyc("Test"); // 调用异步更新操作
        await waitFor(() => !!result.current.name); // 等待更新
    });
    expect(result.current.name).toEqual("Test");
});
```

-   React Hooks Testing Library

```ts
import React from "react";
import { renderHook } from "@testing-library/react-hooks"; // React Hooks Testing Library

const useTestPromise = () => {
    const [name, setName] = React.useState("");
    return {
        name,
        updateAsyc: (v) => Promise.resolve().then(() => setName(v)),
    };
};

test("returns useTestPromise", async () => {
    // async 异步函数
    const { result, waitForNextUpdate } = renderHook(useTestPromise);
    expect(result.current.name).toBe(""); // 检查初始值
    result.current.updateAsyc("Test");
    await waitForNextUpdate(); // 等待异步值更新
    expect(result.current.name).toEqual("Test");
});
```

<details>

[React Hooks Testing Library](https://react-hooks-testing-library.com/) 提供了更为丰富的 API

-   [异步更新 `waitForNextUpdate`](https://react-hooks-testing-library.com/usage/advanced-hooks#async)
-   [错误 `error`](https://react-hooks-testing-library.com/usage/advanced-hooks#errors)

> 但是[React Hooks Testing Library](https://react-hooks-testing-library.com/) 可能会被弃用，请谨慎使用 https://github.com/testing-library/react-hooks-testing-library/issues/849

参考资料
* <https://react-hooks-testing-library.com/reference/api>
* <https://testing-library.com/docs/react-testing-library/api#renderhook>

</details>

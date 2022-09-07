---
layout: post
title: How to write tests
subtitle: 前端测试基础
private: true
# feature-img:
tags:
    - FE
    - test
    - jest
---

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

## test an async hook update

测试异步更新的 hook.

-   React Testing Library (version >= 13)

```ts
import React from "react";
import { act, waitFor, renderHook } from "@testing-library/react"; // React Testing Library Version>= 13.0

const useTestPromise = () => {
    const [name, setName] = React.useState("");
    return {
        name,
        // a function to update date async
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

-   <https://react-hooks-testing-library.com/reference/api>
-   <https://testing-library.com/docs/react-testing-library/api#renderhook>

</details>

## test a component (dom tree)

-   use `@testing-library/react` to `render`
-   fireEvent 触发用户操作事件

### basic render

```tsx
import "@testing-library/jest-dom"; // add custom jest matchers from jest-dom, （可在setup中全局导入）
import { render, screen } from "@testing-library/react"; // import react-testing methods

// 待测试组件
const Test = () => <div data>test</div>;

test("render test", () => {
    render(<Test />); // render the component

    // assert that the alert message is correct using
    expect(screen.getByText("test")).toBeInTheDocument();
});
```

### with user events

```tsx
import "@testing-library/jest-dom";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import Fetch from "../fetch"; // the component to test

test("loads and displays greeting", async () => {
    render(<Fetch url="/greeting" />);

    fireEvent.click(screen.getByText("Load Greeting")); // 点击事件

    await waitFor(() => screen.getByRole("heading")); // 等待页面出现 heading

    expect(screen.getByRole("heading")).toHaveTextContent("hello there"); // 断言文字类容
    expect(screen.getByRole("button")).toBeDisabled(); // 断言按钮状态
});
```

<details>

### @testing-library

-   [queries](https://testing-library.com/docs/queries/about)
-   [full user-event](https://testing-library.com/docs/user-event/setup)
-   [debug](https://testing-library.com/docs/dom-testing-library/api-debugging)
-   [within](https://testing-library.com/docs/dom-testing-library/api-within)

```tsx
import { render, within, screen } from "@testing-library/react";

const { getByText } = render(<MyComponent />);
const messages = getByText("messages");
screen.debug(messages); // print the dom
within(messages).getByText("hello"); // 在 messages 元素内查找
```

### enzyme 测试 React

另一个曾经比较流行的测试框架 [enzyme](https://enzymejs.github.io/enzyme/),维护组件树支持组件和属性 Query,但是其维护状态和对新版 React 支持上均不如 testing-library.
https://npmtrends.com/@testing-library/react-vs-enzyme

```tsx
import { shallow } from "enzyme";
import MyComponent from "./MyComponent";
import Foo from "./Foo";

test("test selector", () => {
    const wrapper = shallow(<MyComponent />);
    expect(wrapper.find("#foo")).to.have.lengthOf(1); // query selector
    expect(wrapper.find(Foo)).to.have.lengthOf(1); // find by components
    expect(wrapper.find({ prop: "value" })).to.have.lengthOf(1); // find by properties
});
```

</details>

# test a component (Snapshot Testing Tests)

Snapshot Testing 保证静态 UI 没有意外变化, UI 更新能清楚标明变化的地方

-   `toMatchSnapshot` to check the snapshot
-   `yarn jest -u` to update snapshots

```tsx
import { create } from "react-test-renderer";
test("Test Snapshot", () => {
    const tree = create(<div>Test</div>); // 渲染结果, state 更新需要 act 包裹
    expect(tree).toMatchSnapshot(); // jest 会检查/更新 快照文件
});
```

<details>

### Snapshot Testing 可以保证 UI 的稳定性，但是不适合逻辑细节的测试

-   [jest snapshot-testing](https://jestjs.io/docs/snapshot-testing)
    > 典型的做法是在渲染了 UI 组件之后，保存一个快照文件， 检测他是否与保存在单元测试旁的快照文件相匹配。 若两个快照不匹配，测试将失败：有可能做了意外的更改，或者 UI 组件已经更新到了新版本。
-   [react snapshot-testing]
    https://reactjs.org/docs/testing-recipes.html#snapshot-testing

> 通常，进行具体的断言比使用快照更好。这类测试包括实现细节，因此很容易中断

</details>

## test an APP (E2E Tests)

让浏览器渲染完整的 APP, 模拟用户进行真实场景的测试 (end-2-end test)

> 使用 [Playwright](https://playwright.dev) https://github.com/microsoft/playwright

更多内容单独说明

<details>

## 主流 E2E 测试工具

-   [Playwright](https://playwright.dev/): a framework for Web Testing and Automation
-   [Cypress](https://www.cypress.io/): a framework and solution for e2e tests
-   [Puppeteer](https://github.com/puppeteer/puppeteer): (lib) Headless Chrome Node.js API

</details>

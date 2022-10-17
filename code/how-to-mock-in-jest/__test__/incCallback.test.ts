import { incCallback } from "../src/com/incCallback";

test("test incCallback", () => {
    const f = jest.fn((n: number) => n);
    const action = incCallback(f);

    expect(action()).toBe(0);
    expect(f).toBeCalledWith(0); // 检查函数调用参数

    expect(action()).toBe(1);
    expect(f).toBeCalledWith(1);
})
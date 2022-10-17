import { f } from "../../src/com/com";
jest.mock("../../src/com/com"); // call manually mock

test("test f", () => {
    expect(f()).toBe("mock function")
})
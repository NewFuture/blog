import * as com from "../../src/com/com";
test("test f", () => {
    jest.spyOn(com, 'f').mockImplementation(() => {
        return "spyOn function"
    })
    expect(com.f()).toBe("spyOn function");
})
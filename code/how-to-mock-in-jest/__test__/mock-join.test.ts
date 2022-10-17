import _ from "lodash";

test("test mock lodash", () => {
  const t = _.join([1, 2]); // 1,2
  expect(t).toBe(3);
});

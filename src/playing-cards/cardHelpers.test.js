//// Tests ////

import { bitCountTest, getBitTest } from "./cardHelpers";

it("get bits of 0", () => {
  expect(getBitTest(0, 0)).toBe(0);
  expect(getBitTest(0, 1)).toBe(0);
  expect(getBitTest(0, 2)).toBe(0);
  expect(getBitTest(0, 3)).toBe(0);
  expect(getBitTest(0, 4)).toBe(0);
});

it("get bits of 1", () => {
  expect(getBitTest(1, 0)).toBe(1);
  expect(getBitTest(1, 1)).toBe(0);
  expect(getBitTest(1, 2)).toBe(0);
  expect(getBitTest(1, 3)).toBe(0);
  expect(getBitTest(1, 4)).toBe(0);
});

it("get bits of 1011", () => {
  expect(getBitTest(11, 0)).toBe(1);
  expect(getBitTest(11, 1)).toBe(1);
  expect(getBitTest(11, 2)).toBe(0);
  expect(getBitTest(11, 3)).toBe(1);
  expect(getBitTest(11, 4)).toBe(0);
});

it("bit counts", () => {
  expect(bitCountTest(0, 5)).toBe(0);
  expect(bitCountTest(1, 5)).toBe(1);
  expect(bitCountTest(2, 5)).toBe(1);
  expect(bitCountTest(4, 5)).toBe(1);
  expect(bitCountTest(3, 5)).toBe(2);
  expect(bitCountTest(6, 5)).toBe(2);
  expect(bitCountTest(31, 5)).toBe(5);
});

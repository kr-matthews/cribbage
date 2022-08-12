//// Mocking ////

//// Imports ////

import { renderHook, act } from "@testing-library/react-hooks";

import { useScores } from "./useScores.js";

//// Initial Values ////

let result;
let rerender;

beforeEach(() => {
  const hook = renderHook(({ playerCount }) => useScores(playerCount), {
    initialProps: { playerCount: 3 },
  });

  result = hook.result;
  rerender = hook.rerender;
});

//// Tests ////

describe("initial state", () => {
  it("do nothing", () => {
    expect(result.current.current).toStrictEqual([0, 0, 0]);
    expect(result.current.previous).toStrictEqual([-1, -1, -1]);
    expect(result.current.hasWinner).toBe(false);
    expect(result.current.nonSkunkCount).toBe(0);
    expect(result.current.skunkCount).toBe(0);
    expect(result.current.doubleSkunkCount).toBe(0);
    expect(result.current.tripleSkunkCount).toBe(0);
    expect(result.current.winner).toBeNull;
    expect(result.current.reset).toBeDefined;
  });

  it("immediately reset", () => {
    act(() => result.current.reset());

    expect(result.current.current).toStrictEqual([0, 0, 0]);
    expect(result.current.previous).toStrictEqual([-1, -1, -1]);
    expect(result.current.hasWinner).toBe(false);
    expect(result.current.nonSkunkCount).toBe(0);
    expect(result.current.skunkCount).toBe(0);
    expect(result.current.doubleSkunkCount).toBe(0);
    expect(result.current.tripleSkunkCount).toBe(0);
    expect(result.current.winner).toBeNull;
  });

  it("update player count", () => {
    rerender({ playerCount: 2 });

    expect(result.current.current).toStrictEqual([0, 0]);
    expect(result.current.previous).toStrictEqual([-1, -1]);
    expect(result.current.hasWinner).toBe(false);
    expect(result.current.nonSkunkCount).toBe(0);
    expect(result.current.skunkCount).toBe(0);
    expect(result.current.doubleSkunkCount).toBe(0);
    expect(result.current.tripleSkunkCount).toBe(0);
    expect(result.current.winner).toBeNull;
  });
});

describe("tracking 1st and 2nd pegs", () => {
  it("one peg", () => {
    act(() => result.current.peg(2, 1));

    expect(result.current.current).toStrictEqual([0, 0, 1]);
    expect(result.current.previous).toStrictEqual([-1, -1, 0]);
    expect(result.current.hasWinner).toBe(false);
    expect(result.current.nonSkunkCount).toBe(0);
    expect(result.current.skunkCount).toBe(0);
    expect(result.current.doubleSkunkCount).toBe(0);
    expect(result.current.tripleSkunkCount).toBe(0);
    expect(result.current.winner).toBeNull;

    act(() => result.current.peg(0, 29));

    expect(result.current.current).toStrictEqual([29, 0, 1]);
    expect(result.current.previous).toStrictEqual([0, -1, 0]);
    expect(result.current.hasWinner).toBe(false);
    expect(result.current.nonSkunkCount).toBe(0);
    expect(result.current.skunkCount).toBe(0);
    expect(result.current.doubleSkunkCount).toBe(0);
    expect(result.current.tripleSkunkCount).toBe(0);
    expect(result.current.winner).toBeNull;

    act(() => result.current.peg(1, 2));

    expect(result.current.current).toStrictEqual([29, 2, 1]);
    expect(result.current.previous).toStrictEqual([0, 0, 0]);
    expect(result.current.hasWinner).toBe(false);
    expect(result.current.nonSkunkCount).toBe(0);
    expect(result.current.skunkCount).toBe(0);
    expect(result.current.doubleSkunkCount).toBe(0);
    expect(result.current.tripleSkunkCount).toBe(0);
    expect(result.current.winner).toBeNull;
  });

  it("multiple pegs", () => {
    act(() => result.current.peg(1, 6));
    act(() => result.current.peg(1, 1));
    act(() => result.current.peg(0, 4));
    act(() => result.current.peg(1, 28));

    expect(result.current.current).toStrictEqual([4, 35, 0]);
    expect(result.current.previous).toStrictEqual([0, 7, -1]);
    expect(result.current.hasWinner).toBe(false);
    expect(result.current.nonSkunkCount).toBe(0);
    expect(result.current.skunkCount).toBe(0);
    expect(result.current.doubleSkunkCount).toBe(0);
    expect(result.current.tripleSkunkCount).toBe(0);
    expect(result.current.winner).toBeNull;
  });
});

describe("winning", () => {
  // todo TESTS: useScores - winning
  it("no winner yet", () => {});
  it("exactly 120", () => {});
  it("regular win", () => {});
  it("skunk win", () => {});
  it("double-skunk win", () => {});
  it("triple skunk win", () => {});
});

// import { render } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react-hooks";

import { useScores } from "./useScores.js";

//// Tests

it("initial state", () => {
  const scores = renderHook(() => useScores()).result.current;

  expect(scores.current).toStrictEqual([0, 0, 0]);
  expect(scores.previous).toStrictEqual([0, 0, 0]);
  expect(scores.peg).toBeDefined;
  expect(scores.hasWinner).toBe(false);
  expect(scores.winner).toBeNull;
  expect(scores.reset).toBeDefined;
});

it("peg a player once", () => {
  const { result } = renderHook(() => useScores());

  act(() => result.current.peg(2, 7));

  expect(result.current.current).toStrictEqual([0, 0, 7]);
  expect(result.current.previous).toStrictEqual([0, 0, 0]);
  expect(result.current.hasWinner).toBe(false);
  expect(result.current.winner).toBeNull;
});

it("peg a player several times", () => {
  const { result } = renderHook(() => useScores());

  act(() => result.current.peg(2, 7));

  expect(result.current.current).toStrictEqual([0, 0, 7]);
  expect(result.current.previous).toStrictEqual([0, 0, 0]);

  act(() => result.current.peg(2, 5));

  expect(result.current.current).toStrictEqual([0, 0, 12]);
  expect(result.current.previous).toStrictEqual([0, 0, 7]);

  act(() => result.current.peg(2, 25));

  expect(result.current.current).toStrictEqual([0, 0, 37]);
  expect(result.current.previous).toStrictEqual([0, 0, 12]);
  expect(result.current.hasWinner).toBe(false);
  expect(result.current.winner).toBeNull;
});

it("peg multiple players", () => {
  const { result } = renderHook(() => useScores());

  act(() => result.current.peg(1, 18));

  expect(result.current.current).toStrictEqual([0, 18, 0]);
  expect(result.current.previous).toStrictEqual([0, 0, 0]);

  act(() => result.current.peg(0, 5));

  expect(result.current.current).toStrictEqual([5, 18, 0]);
  expect(result.current.previous).toStrictEqual([0, 0, 0]);

  act(() => result.current.peg(2, 1));

  expect(result.current.current).toStrictEqual([5, 18, 1]);
  expect(result.current.previous).toStrictEqual([0, 0, 0]);
  expect(result.current.hasWinner).toBe(false);
  expect(result.current.winner).toBeNull;
});

it("peg multiple players several times", () => {
  const { result } = renderHook(() => useScores());

  act(() => result.current.peg(1, 8));

  expect(result.current.current).toStrictEqual([0, 8, 0]);
  expect(result.current.previous).toStrictEqual([0, 0, 0]);

  act(() => result.current.peg(0, 6));

  expect(result.current.current).toStrictEqual([6, 8, 0]);
  expect(result.current.previous).toStrictEqual([0, 0, 0]);

  act(() => result.current.peg(1, 3));

  expect(result.current.current).toStrictEqual([6, 11, 0]);
  expect(result.current.previous).toStrictEqual([0, 8, 0]);

  act(() => result.current.peg(2, 3));

  expect(result.current.current).toStrictEqual([6, 11, 3]);
  expect(result.current.previous).toStrictEqual([0, 8, 0]);

  act(() => result.current.peg(1, 1));

  expect(result.current.current).toStrictEqual([6, 12, 3]);
  expect(result.current.previous).toStrictEqual([0, 11, 0]);
  expect(result.current.hasWinner).toBe(false);
  expect(result.current.winner).toBeNull;
});

it("reset after pegging", () => {
  const { result } = renderHook(() => useScores());

  act(() => result.current.peg(1, 8));
  act(() => result.current.peg(0, 6));
  act(() => result.current.peg(1, 3));
  act(() => result.current.peg(2, 3));
  act(() => result.current.peg(1, 1));

  expect(result.current.current).toStrictEqual([6, 12, 3]);
  expect(result.current.previous).toStrictEqual([0, 11, 0]);
  expect(result.current.hasWinner).toBe(false);
  expect(result.current.winner).toBeNull;

  act(() => result.current.reset());

  expect(result.current.current).toStrictEqual([0, 0, 0]);
  expect(result.current.previous).toStrictEqual([0, 0, 0]);
  expect(result.current.hasWinner).toBe(false);
  expect(result.current.winner).toBeNull;
});

it("win and reset", () => {
  const { result } = renderHook(() => useScores());

  act(() => result.current.peg(1, 60));
  act(() => result.current.peg(0, 24));
  act(() => result.current.peg(1, 2));
  act(() => result.current.peg(0, 62));
  act(() => result.current.peg(0, 7));
  act(() => result.current.peg(2, 2));
  act(() => result.current.peg(0, 20));
  act(() => result.current.peg(1, 58));

  expect(result.current.current).toStrictEqual([113, 120, 2]);
  expect(result.current.previous).toStrictEqual([93, 62, 0]);
  expect(result.current.hasWinner).toBe(false);
  expect(result.current.winner).toBeNull;

  act(() => result.current.peg(1, 1));

  expect(result.current.current).toStrictEqual([113, 121, 2]);
  expect(result.current.previous).toStrictEqual([93, 120, 0]);
  expect(result.current.hasWinner).toBe(true);
  expect(result.current.winner).toBe(1);

  act(() => result.current.reset());

  expect(result.current.current).toStrictEqual([0, 0, 0]);
  expect(result.current.previous).toStrictEqual([0, 0, 0]);
  expect(result.current.hasWinner).toBe(false);
  expect(result.current.winner).toBeNull;
});

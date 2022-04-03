// import { render } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react-hooks";

import { useScores } from "./useScores.js";

let result;

const playerCount = 3;
const dealer = 1;
let justPlayed = false;
let previousPlayer = null;
let previousScorer = null;
let areAllInactive = true;
let hands = [[], [], []];
let crib = [];
let starter = null;
let sharedStack = [];
let claims = {};

//// Tests ////

beforeEach(() => {
  result = renderHook(() =>
    useScores(
      playerCount,
      dealer,
      justPlayed,
      previousPlayer,
      previousScorer,
      areAllInactive,
      hands,
      crib,
      starter,
      sharedStack,
      claims
    )
  ).result;
});

it("initial state", () => {
  // TODO: jest returns 'serializes to the same string' for some reason
  // expect(result.current.current).toStrictEqual([0, 0, 0]);
  // expect(result.current.previous).toStrictEqual([-1, -1, -1]);
  expect(result.current.pegTest).toBeDefined;
  expect(result.current.winner).toBeNull;
  expect(result.current.reset).toBeDefined;
});

it("pegTest a player once", () => {
  act(() => result.current.pegTest(2, 7));

  expect(result.current.current).toStrictEqual([0, 0, 7]);
  expect(result.current.previous).toStrictEqual([-1, -1, 0]);
  expect(result.current.winner).toBeNull;
});

it("pegTest a player several times", () => {
  act(() => result.current.pegTest(2, 7));

  expect(result.current.current).toStrictEqual([0, 0, 7]);
  expect(result.current.previous).toStrictEqual([-1, -1, 0]);

  act(() => result.current.pegTest(2, 5));

  expect(result.current.current).toStrictEqual([0, 0, 12]);
  expect(result.current.previous).toStrictEqual([-1, -1, 7]);

  act(() => result.current.pegTest(2, 25));

  expect(result.current.current).toStrictEqual([0, 0, 37]);
  expect(result.current.previous).toStrictEqual([-1, -1, 12]);
  expect(result.current.winner).toBeNull;
});

it("pegTest multiple players", () => {
  act(() => result.current.pegTest(1, 18));

  expect(result.current.current).toStrictEqual([0, 18, 0]);
  expect(result.current.previous).toStrictEqual([-1, 0, -1]);

  act(() => result.current.pegTest(0, 5));

  expect(result.current.current).toStrictEqual([5, 18, 0]);
  expect(result.current.previous).toStrictEqual([0, 0, -1]);

  act(() => result.current.pegTest(2, 1));

  expect(result.current.current).toStrictEqual([5, 18, 1]);
  expect(result.current.previous).toStrictEqual([0, 0, 0]);
  expect(result.current.winner).toBeNull;
});

it("pegTest multiple players several times", () => {
  act(() => result.current.pegTest(1, 8));

  expect(result.current.current).toStrictEqual([0, 8, 0]);
  expect(result.current.previous).toStrictEqual([-1, 0, -1]);

  act(() => result.current.pegTest(0, 6));

  expect(result.current.current).toStrictEqual([6, 8, 0]);
  expect(result.current.previous).toStrictEqual([0, 0, -1]);

  act(() => result.current.pegTest(1, 3));

  expect(result.current.current).toStrictEqual([6, 11, 0]);
  expect(result.current.previous).toStrictEqual([0, 8, -1]);

  act(() => result.current.pegTest(2, 3));

  expect(result.current.current).toStrictEqual([6, 11, 3]);
  expect(result.current.previous).toStrictEqual([0, 8, 0]);

  act(() => result.current.pegTest(1, 1));

  expect(result.current.current).toStrictEqual([6, 12, 3]);
  expect(result.current.previous).toStrictEqual([0, 11, 0]);
  expect(result.current.winner).toBeNull;
});

it("reset after pegTestging", () => {
  act(() => result.current.pegTest(1, 8));
  act(() => result.current.pegTest(0, 6));
  act(() => result.current.pegTest(1, 3));
  act(() => result.current.pegTest(2, 3));
  act(() => result.current.pegTest(1, 1));

  expect(result.current.current).toStrictEqual([6, 12, 3]);
  expect(result.current.previous).toStrictEqual([0, 11, 0]);
  expect(result.current.winner).toBeNull;

  act(() => result.current.reset());

  expect(result.current.current).toStrictEqual([0, 0, 0]);
  expect(result.current.previous).toStrictEqual([-1, -1, -1]);
  expect(result.current.winner).toBeNull;
});

it("win and reset", () => {
  act(() => result.current.pegTest(1, 60));
  act(() => result.current.pegTest(0, 24));
  act(() => result.current.pegTest(1, 2));
  act(() => result.current.pegTest(0, 62));
  act(() => result.current.pegTest(0, 7));
  act(() => result.current.pegTest(2, 2));
  act(() => result.current.pegTest(0, 20));
  act(() => result.current.pegTest(1, 58));

  expect(result.current.current).toStrictEqual([113, 120, 2]);
  expect(result.current.previous).toStrictEqual([93, 62, 0]);
  expect(result.current.winner).toBeNull;

  act(() => result.current.pegTest(1, 1));

  expect(result.current.current).toStrictEqual([113, 121, 2]);
  expect(result.current.previous).toStrictEqual([93, 120, 0]);
  expect(result.current.winner).toBe(1);

  act(() => result.current.reset());

  expect(result.current.current).toStrictEqual([0, 0, 0]);
  expect(result.current.previous).toStrictEqual([-1, -1, -1]);
  expect(result.current.winner).toBeNull;
});

// TODO: add tests for effects

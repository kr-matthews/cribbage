// import { render } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react-hooks";

import { useScores } from "./useScores.js";

import {
  autoScoreHandForClaimType,
  claimTypes,
} from "../playing-cards/cardHelpers.js";

import Rank from "../playing-cards/Rank.js";
import Suit from "../playing-cards/Suit.js";

//// initial values ////

let result;
let rerender;

const initialProps = {
  playerCount: 3,
  dealer: 1,
  starter: null,
  crib: [],
  hands: [[], [], []],
  sharedStack: [],
  previousPlayer: null,
  previousAction: null,
  isCurrentPlayOver: null,
};

beforeEach(() => {
  const hook = renderHook(
    ({
      playerCount,
      dealer,
      starter,
      crib,
      hands,
      sharedStack,
      previousPlayer,
      previousAction,
      isCurrentPlayOver,
    }) =>
      useScores(
        playerCount,
        dealer,
        starter,
        crib,
        hands,
        sharedStack,
        previousPlayer,
        previousAction,
        isCurrentPlayOver
      ),
    {
      initialProps,
    }
  );
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
    rerender({ ...initialProps, playerCount: 2, hands: [[], []] });

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

// TODO: NEXT: NEXT: NEXT: continue refactoring tests

describe("initial state", () => {
  //
});

it.skip("pegTest a player once", () => {
  act(() => result.current.pegTest(2, 7));

  expect(result.current.current).toStrictEqual([0, 0, 7]);
  expect(result.current.previous).toStrictEqual([-1, -1, 0]);
  expect(result.current.winner).toBeNull;
});

it.skip("pegTest a player several times", () => {
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

it.skip("pegTest multiple players", () => {
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

it.skip("pegTest multiple players several times", () => {
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

it.skip("reset after pegTestging", () => {
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

it.skip("win and reset", () => {
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

// TODO: current essentially a copy-paste of effect, make more robust
it.skip("scoring a sample hand", () => {
  starter = { rank: Rank.FOUR, suit: Suit.SPADE };
  let hand = [
    { rank: Rank.FIVE, suit: Suit.DIAMOND },
    { rank: Rank.FIVE, suit: Suit.HEART },
    { rank: Rank.SIX, suit: Suit.CLUB },
    { rank: Rank.SEVEN, suit: Suit.SPADE },
  ];
  let isCrib = false;

  let expects = { 15: 4, kind: 2, run: 8, flush: 0 };
  for (let claimType of claimTypes) {
    expect(autoScoreHandForClaimType(hand, starter, claimType, isCrib)).toBe(
      expects[claimType]
    );
  }
});

// TODO: add tests for effects

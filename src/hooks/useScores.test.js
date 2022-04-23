//// Mocking ////

jest.mock("../playing-cards/cardHelpers.js", () => {
  const actualModule = jest.requireActual("../playing-cards/cardHelpers.js");

  return {
    __esModule: true,
    ...actualModule,
    autoScoreHandForClaimType: jest.fn(),
    autoScoreStackForClaimType: jest.fn(),
  };
});

//// Imports ////

import { renderHook, act } from "@testing-library/react-hooks";

import { useScores } from "./useScores.js";

import {
  checkClaim,
  pointsForClaim,
  autoScoreHandForClaimType,
  autoScoreStackForClaimType,
} from "../playing-cards/cardHelpers.js";

import Rank from "../playing-cards/Rank.js";
import Suit from "../playing-cards/Suit.js";
import Action from "./Action.js";

const starter = { rank: Rank.FIVE, suit: Suit.SPADE };

//// Initial Values ////

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

describe("revealing the starter card", () => {
  it("cutting a non-Jack", () => {
    rerender({
      ...initialProps,
      starter: { rank: Rank.FIVE, suit: Suit.SPADE },
    });

    expect(result.current.current).toStrictEqual([0, 0, 0]);
    expect(result.current.previous).toStrictEqual([-1, -1, -1]);
    expect(result.current.hasWinner).toBe(false);
    expect(result.current.winner).toBeNull;
  });

  it("cutting a Jack", () => {
    rerender({
      ...initialProps,
      starter: { rank: Rank.JACK, suit: Suit.HEART },
    });

    expect(result.current.current).toStrictEqual([0, 2, 0]);
    expect(result.current.previous).toStrictEqual([-1, 0, -1]);
    expect(result.current.hasWinner).toBe(false);
    expect(result.current.winner).toBeNull;
  });
});

describe("the play phase", () => {
  it("first card", () => {
    autoScoreStackForClaimType.mockReturnValue(0);
    rerender({ ...initialProps, starter });
    rerender({
      ...initialProps,
      starter,
      sharedStack: [{ rank: Rank.ACE, suit: Suit.DIAMOND }],
      previousPlayer: 2,
      previousAction: Action.PLAY,
      isCurrentPlayOver: false,
    });

    expect(result.current.current).toStrictEqual([0, 0, 0]);
    expect(result.current.previous).toStrictEqual([-1, -1, -1]);
    expect(result.current.hasWinner).toBe(false);
    expect(result.current.winner).toBeNull;
  });

  it("second cards", () => {
    autoScoreStackForClaimType.mockReturnValue(0);
    rerender({ ...initialProps, starter });
    rerender({
      ...initialProps,
      starter,
      sharedStack: [{ rank: Rank.SIX, suit: Suit.CLUB }],
      previousPlayer: 2,
      previousAction: Action.PLAY,
      isCurrentPlayOver: false,
    });

    autoScoreStackForClaimType.mockImplementation((_, claim) =>
      claim === "15" ? 2 : 0
    );
    rerender({
      ...initialProps,
      starter,
      sharedStack: [{ rank: Rank.NINE, suit: Suit.DIAMOND }],
      previousPlayer: 0,
      previousAction: Action.PLAY,
      isCurrentPlayOver: false,
    });

    expect(result.current.current).toStrictEqual([2, 0, 0]);
    expect(result.current.previous).toStrictEqual([0, -1, -1]);
    expect(result.current.hasWinner).toBe(false);
    expect(result.current.winner).toBeNull;
  });

  it("a go", () => {
    autoScoreStackForClaimType.mockReturnValue(0);
    rerender({ ...initialProps, starter });
    rerender({
      ...initialProps,
      starter,
      sharedStack: [{ rank: Rank.SIX, suit: Suit.CLUB }],
      previousPlayer: 2,
      previousAction: Action.PLAY,
      isCurrentPlayOver: false,
    });

    expect(result.current.current).toStrictEqual([0, 0, 0]);
    expect(result.current.previous).toStrictEqual([-1, -1, -1]);

    autoScoreStackForClaimType.mockReturnValue(0);
    rerender({
      ...initialProps,
      starter,
      sharedStack: [
        { rank: Rank.SIX, suit: Suit.CLUB },
        { rank: Rank.FOUR, suit: Suit.SPADE },
      ],
      previousPlayer: 0,
      previousAction: Action.PLAY,
      isCurrentPlayOver: false,
    });

    expect(result.current.current).toStrictEqual([0, 0, 0]);
    expect(result.current.previous).toStrictEqual([-1, -1, -1]);

    autoScoreStackForClaimType.mockReturnValue(99);
    rerender({
      ...initialProps,
      starter,
      sharedStack: [
        { rank: Rank.SIX, suit: Suit.CLUB },
        { rank: Rank.FOUR, suit: Suit.SPADE },
      ],
      previousPlayer: 1,
      previousAction: Action.GO,
      isCurrentPlayOver: false,
    });

    expect(result.current.current).toStrictEqual([0, 0, 0]);
    expect(result.current.previous).toStrictEqual([-1, -1, -1]);

    autoScoreStackForClaimType.mockReturnValue(99);
    rerender({
      ...initialProps,
      starter,
      sharedStack: [
        { rank: Rank.SIX, suit: Suit.CLUB },
        { rank: Rank.FOUR, suit: Suit.SPADE },
        { rank: Rank.FIVE, suit: Suit.CLUB },
      ],
      previousPlayer: 2,
      previousAction: Action.GO,
      isCurrentPlayOver: false,
    });

    expect(result.current.current).toStrictEqual([0, 0, 0]);
    expect(result.current.previous).toStrictEqual([-1, -1, -1]);

    autoScoreStackForClaimType.mockImplementation((_, claim) =>
      claim === "run" ? 3 : 0
    );
    rerender({
      ...initialProps,
      starter,
      sharedStack: [
        { rank: Rank.SIX, suit: Suit.CLUB },
        { rank: Rank.FOUR, suit: Suit.SPADE },
      ],
      previousPlayer: 0,
      previousAction: Action.PLAY,
      isCurrentPlayOver: false,
    });

    expect(result.current.current).toStrictEqual([3, 0, 0]);
    expect(result.current.previous).toStrictEqual([0, -1, -1]);
  });

  it("ending with a go", () => {
    // TODO: useScores test: end on go
  });

  it("ending on 31", () => {
    // TODO: useScores test: end on 31
  });

  it("ending on last card", () => {
    // TODO: useScores test: end on last card
  });
});

describe("the scoring phase", () => {
  it("test", () => {
    // TODO: useScores test: scoring hands, crib
  });
});

describe("tracking 1st and 2nd pegs", () => {
  it("test", () => {
    // TODO: useScores test: peg positions
  });
});

describe("winning", () => {
  it("test", () => {
    rerender({ ...initialProps, starter });

    autoScoreStackForClaimType.mockImplementation((_, claim) =>
      claim === "15" ? 100 : 0
    );
    rerender({
      ...initialProps,
      starter,
      sharedStack: [{ rank: Rank.NINE, suit: Suit.DIAMOND }],
      previousPlayer: 1,
      previousAction: Action.PLAY,
      isCurrentPlayOver: false,
    });

    expect(result.current.current).toStrictEqual([0, 100, 0]);
    expect(result.current.previous).toStrictEqual([-1, 0, -1]);
    expect(result.current.hasWinner).toBe(false);
    expect(result.current.winner).toBeNull;

    autoScoreStackForClaimType.mockImplementation((_, claim) =>
      claim === "15" ? 61 : 0
    );
    rerender({
      ...initialProps,
      starter,
      sharedStack: [{ rank: Rank.NINE, suit: Suit.DIAMOND }],
      previousPlayer: 2,
      previousAction: Action.PLAY,
      isCurrentPlayOver: false,
    });

    expect(result.current.current).toStrictEqual([0, 100, 61]);
    expect(result.current.previous).toStrictEqual([-1, 0, 0]);
    expect(result.current.hasWinner).toBe(false);
    expect(result.current.winner).toBeNull;

    autoScoreStackForClaimType.mockImplementation((_, claim) =>
      claim === "15" ? 60 : 0
    );
    rerender({
      ...initialProps,
      starter,
      sharedStack: [{ rank: Rank.NINE, suit: Suit.DIAMOND }],
      previousPlayer: 0,
      previousAction: Action.PLAY,
      isCurrentPlayOver: false,
    });

    expect(result.current.current).toStrictEqual([60, 100, 61]);
    expect(result.current.previous).toStrictEqual([0, 0, 0]);
    expect(result.current.hasWinner).toBe(false);
    expect(result.current.winner).toBeNull;

    autoScoreStackForClaimType.mockImplementation((_, claim) =>
      claim === "15" ? 60 : 0
    );
    rerender({
      ...initialProps,
      starter,
      sharedStack: [{ rank: Rank.NINE, suit: Suit.DIAMOND }],
      previousPlayer: 0,
      previousAction: Action.PLAY,
      isCurrentPlayOver: false,
    });

    expect(result.current.current).toStrictEqual([120, 100, 61]);
    expect(result.current.previous).toStrictEqual([60, 0, 0]);
    expect(result.current.hasWinner).toBe(false);
    expect(result.current.nonSkunkCount).toBe(0);
    expect(result.current.skunkCount).toBe(0);
    expect(result.current.doubleSkunkCount).toBe(0);
    expect(result.current.tripleSkunkCount).toBe(0);
    expect(result.current.winner).toBeNull;

    autoScoreStackForClaimType.mockImplementation((_, claim) =>
      claim === "15" ? 21 : 0
    );
    rerender({
      ...initialProps,
      starter,
      sharedStack: [{ rank: Rank.NINE, suit: Suit.DIAMOND }],
      previousPlayer: 1,
      previousAction: Action.PLAY,
      isCurrentPlayOver: false,
    });

    expect(result.current.current).toStrictEqual([120, 121, 61]);
    expect(result.current.previous).toStrictEqual([60, 100, 0]);
    expect(result.current.hasWinner).toBe(true);
    expect(result.current.nonSkunkCount).toBe(1);
    expect(result.current.skunkCount).toBe(1);
    expect(result.current.doubleSkunkCount).toBe(0);
    expect(result.current.tripleSkunkCount).toBe(0);
    expect(result.current.winner).toBe(1);
  });
});

// NOTE: could test other actions during a round _don't_ cause any points to be scored

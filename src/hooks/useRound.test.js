import { renderHook, act } from "@testing-library/react-hooks";

import { useRound } from "./useRound.js";

import Rank from "./../playing-cards/Rank.js";
import Suit from "./../playing-cards/Suit.js";
import Action from "./Action.js";
import { cardSorter } from "../playing-cards/cardHelpers.js";

//// Setup ////

// QUESTION: how to preserve the hook state between tests, to avoid dealing etc at the start of each test?
// nothing I've tried works

// NOTE: Certain round actions only change things inside the parameters (the deck, and the previousPlayerAction)
// so renderHook doesn't seem to rerender itself and side-effects aren't run. A manual call to rerender was added to fix this.

// TODO: Probably best to remove `expect` statements about the mockedPreviousPlayerAction? (And the commented out tests.)

//// Params for the useRound hook being tested ////

// mock useDeck hook
let mockCards;
const initialMockCards = [
  { rank: Rank.TEN, suit: Suit.HEART },
  { rank: Rank.TEN, suit: Suit.DIAMOND },
  { rank: Rank.FIVE, suit: Suit.DIAMOND },
  { rank: Rank.JACK, suit: Suit.HEART },
  { rank: Rank.TEN, suit: Suit.SPADE },
  { rank: Rank.FIVE, suit: Suit.HEART },
  { rank: Rank.QUEEN, suit: Suit.DIAMOND },
  { rank: Rank.JACK, suit: Suit.CLUB },
  { rank: Rank.KING, suit: Suit.CLUB },
  { rank: Rank.FIVE, suit: Suit.SPADE },
  { rank: Rank.ACE, suit: Suit.DIAMOND },
  { rank: Rank.FIVE, suit: Suit.CLUB },
  { rank: Rank.NINE, suit: Suit.HEART },
  { rank: Rank.TWO, suit: Suit.HEART },
  { rank: Rank.THREE, suit: Suit.HEART },
  { rank: Rank.JACK, suit: Suit.DIAMOND },
  { rank: Rank.QUEEN, suit: Suit.HEART },
  { rank: Rank.SIX, suit: Suit.SPADE },
];
const mockDeck = {
  draw: () => [mockCards.pop()],
  cut: () => null,
  uncut: () => null,
};

// mock usePreviousPlayerAction hook
const mockPreviousPlayerAction = {};
const makePlayerArray = (player) => {
  let arr = Array(playerCount).fill(false);
  // player might be negative
  arr[(player + playerCount) % playerCount] = true;
  return arr;
};
const setPreviousPlayerAction = (player, action) => {
  mockPreviousPlayerAction.previousPlayer = player;
  mockPreviousPlayerAction.previousAction = action;
};
mockPreviousPlayerAction.makePlayerArray = makePlayerArray;
mockPreviousPlayerAction.setPreviousPlayerAction = setPreviousPlayerAction;

// other params
const playerCount = 3;
let dealer = 2;

//// Params and Returns of renderHook ///

// params
let initialProps = {
  mockDeck,
  playerCount,
  dealer,
  mockPreviousPlayerAction,
};

// returns
let result;
let rerender;

//// Other Testing Constants ////

// the starter in all tests (when not null)
const starter = {
  rank: Rank.TEN,
  suit: Suit.DIAMOND,
};

//// Test Set Up ////

beforeEach(() => {
  // reset mock params
  mockCards = initialMockCards.slice(); // make a copy of the original array
  mockPreviousPlayerAction.previousPlayer = null;
  mockPreviousPlayerAction.previousAction = null;

  // render hook from scratch
  const renderedHook = renderHook(
    ({ mockDeck, playerCount, dealer, mockPreviousPlayerAction }) =>
      useRound(mockDeck, playerCount, dealer, mockPreviousPlayerAction),
    { initialProps }
  );

  // extract returns
  result = renderedHook.result;
  rerender = renderedHook.rerender;
});

//// Tests ////

describe("run through a round", () => {
  describe("start", () => {
    test("initial state", () => {
      expect(result.current.starter).toBeNull;
      expect(result.current.crib).toStrictEqual([]);
      expect(result.current.hands).toStrictEqual([[], [], []]);
      expect(result.current.piles).toStrictEqual([[], [], []]);
      expect(result.current.sharedStack).toStrictEqual([]);

      expect(mockPreviousPlayerAction.previousPlayer).toBeNull;
      expect(mockPreviousPlayerAction.previousAction).toBeNull;
      expect(result.current.nextPlayers).toStrictEqual([false, false, true]);
      expect(result.current.nextAction).toBe(Action.START_DEALING);
      // expect(roundHook.current.previousCardPlayedBy).toBeNull;
      expect(result.current.isCurrentPlayOver).toBeNull;
    });
  });

  describe("dealing", () => {
    test("deal", () => {
      act(() => result.current.deal());
      rerender({ ...initialProps });

      expect(result.current.starter).toBeNull;
      expect(result.current.crib).toStrictEqual([
        { rank: Rank.FIVE, suit: Suit.DIAMOND },
      ]);
      expect(
        result.current.hands.map((hand) => hand.sort(cardSorter))
      ).toStrictEqual([
        [
          { rank: Rank.THREE, suit: Suit.HEART },
          { rank: Rank.FIVE, suit: Suit.CLUB },
          { rank: Rank.FIVE, suit: Suit.HEART },
          { rank: Rank.SIX, suit: Suit.SPADE },
          { rank: Rank.KING, suit: Suit.CLUB },
        ],
        [
          { rank: Rank.ACE, suit: Suit.DIAMOND },
          { rank: Rank.TWO, suit: Suit.HEART },
          { rank: Rank.TEN, suit: Suit.SPADE },
          { rank: Rank.JACK, suit: Suit.CLUB },
          { rank: Rank.QUEEN, suit: Suit.HEART },
        ],
        [
          { rank: Rank.FIVE, suit: Suit.SPADE },
          { rank: Rank.NINE, suit: Suit.HEART },
          { rank: Rank.JACK, suit: Suit.DIAMOND },
          { rank: Rank.JACK, suit: Suit.HEART },
          { rank: Rank.QUEEN, suit: Suit.DIAMOND },
        ],
      ]);
      expect(result.current.piles).toStrictEqual([[], [], []]);
      expect(result.current.sharedStack).toStrictEqual([]);

      expect(mockPreviousPlayerAction.previousPlayer).toBe(dealer);
      expect(mockPreviousPlayerAction.previousAction).toBe(
        Action.CONTINUE_DEALING
      );
      expect(result.current.nextPlayers).toStrictEqual([true, true, true]);
      expect(result.current.nextAction).toBe(Action.DISCARD);
      // expect(roundHook.current.previousCardPlayedBy).toBeNull;
      expect(result.current.isCurrentPlayOver).toBeNull;
    });
  });

  describe("discarding", () => {
    test("first player 2", () => {
      act(() => result.current.deal());
      rerender({ ...initialProps });
      act(() => result.current.discardToCrib(2, [2]));

      expect(result.current.starter).toBeNull;
      expect(result.current.crib).toStrictEqual([
        { rank: Rank.FIVE, suit: Suit.DIAMOND },
        { rank: Rank.JACK, suit: Suit.DIAMOND },
      ]);
      expect(
        result.current.hands.map((hand) => hand.sort(cardSorter))
      ).toStrictEqual([
        [
          { rank: Rank.THREE, suit: Suit.HEART },
          { rank: Rank.FIVE, suit: Suit.CLUB },
          { rank: Rank.FIVE, suit: Suit.HEART },
          { rank: Rank.SIX, suit: Suit.SPADE },
          { rank: Rank.KING, suit: Suit.CLUB },
        ],
        [
          { rank: Rank.ACE, suit: Suit.DIAMOND },
          { rank: Rank.TWO, suit: Suit.HEART },
          { rank: Rank.TEN, suit: Suit.SPADE },
          { rank: Rank.JACK, suit: Suit.CLUB },
          { rank: Rank.QUEEN, suit: Suit.HEART },
        ],
        [
          { rank: Rank.FIVE, suit: Suit.SPADE },
          { rank: Rank.NINE, suit: Suit.HEART },
          { rank: Rank.JACK, suit: Suit.HEART },
          { rank: Rank.QUEEN, suit: Suit.DIAMOND },
        ],
      ]);
      expect(result.current.piles).toStrictEqual([[], [], []]);
      expect(result.current.sharedStack).toStrictEqual([]);

      expect(mockPreviousPlayerAction.previousPlayer).toBe(2);
      expect(mockPreviousPlayerAction.previousAction).toBe(Action.DISCARD);
      expect(result.current.nextPlayers).toStrictEqual([true, true, false]);
      expect(result.current.nextAction).toBe(Action.DISCARD);
      // expect(roundHook.current.previousCardPlayedBy).toBeNull;
      expect(result.current.isCurrentPlayOver).toBeNull;
    });

    test("then player 0", () => {
      act(() => result.current.deal());
      rerender({ ...initialProps });
      act(() => result.current.discardToCrib(2, [2]));
      act(() => result.current.discardToCrib(0, [3]));

      expect(result.current.starter).toBeNull;
      expect(result.current.crib).toStrictEqual([
        { rank: Rank.FIVE, suit: Suit.DIAMOND },
        { rank: Rank.SIX, suit: Suit.SPADE },
        { rank: Rank.JACK, suit: Suit.DIAMOND },
      ]);
      expect(
        result.current.hands.map((hand) => hand.sort(cardSorter))
      ).toStrictEqual([
        [
          { rank: Rank.THREE, suit: Suit.HEART },
          { rank: Rank.FIVE, suit: Suit.CLUB },
          { rank: Rank.FIVE, suit: Suit.HEART },
          { rank: Rank.KING, suit: Suit.CLUB },
        ],
        [
          { rank: Rank.ACE, suit: Suit.DIAMOND },
          { rank: Rank.TWO, suit: Suit.HEART },
          { rank: Rank.TEN, suit: Suit.SPADE },
          { rank: Rank.JACK, suit: Suit.CLUB },
          { rank: Rank.QUEEN, suit: Suit.HEART },
        ],
        [
          { rank: Rank.FIVE, suit: Suit.SPADE },
          { rank: Rank.NINE, suit: Suit.HEART },
          { rank: Rank.JACK, suit: Suit.HEART },
          { rank: Rank.QUEEN, suit: Suit.DIAMOND },
        ],
      ]);
      expect(result.current.piles).toStrictEqual([[], [], []]);
      expect(result.current.sharedStack).toStrictEqual([]);

      expect(mockPreviousPlayerAction.previousPlayer).toBe(0);
      expect(mockPreviousPlayerAction.previousAction).toBe(Action.DISCARD);
      expect(result.current.nextPlayers).toStrictEqual([false, true, false]);
      expect(result.current.nextAction).toBe(Action.DISCARD);
      // expect(roundHook.current.previousCardPlayedBy).toBeNull;
      expect(result.current.isCurrentPlayOver).toBeNull;
    });

    test("finally player 1", () => {
      act(() => result.current.deal());
      rerender({ ...initialProps });
      act(() => result.current.discardToCrib(2, [2]));
      act(() => result.current.discardToCrib(0, [3]));
      act(() => result.current.discardToCrib(1, [4]));

      expect(result.current.starter).toBeNull;
      expect(result.current.crib).toStrictEqual([
        { rank: Rank.FIVE, suit: Suit.DIAMOND },
        { rank: Rank.SIX, suit: Suit.SPADE },
        { rank: Rank.JACK, suit: Suit.DIAMOND },
        { rank: Rank.QUEEN, suit: Suit.HEART },
      ]);
      expect(
        result.current.hands.map((hand) => hand.sort(cardSorter))
      ).toStrictEqual([
        [
          { rank: Rank.THREE, suit: Suit.HEART },
          { rank: Rank.FIVE, suit: Suit.CLUB },
          { rank: Rank.FIVE, suit: Suit.HEART },
          { rank: Rank.KING, suit: Suit.CLUB },
        ],
        [
          { rank: Rank.ACE, suit: Suit.DIAMOND },
          { rank: Rank.TWO, suit: Suit.HEART },
          { rank: Rank.TEN, suit: Suit.SPADE },
          { rank: Rank.JACK, suit: Suit.CLUB },
        ],
        [
          { rank: Rank.FIVE, suit: Suit.SPADE },
          { rank: Rank.NINE, suit: Suit.HEART },
          { rank: Rank.JACK, suit: Suit.HEART },
          { rank: Rank.QUEEN, suit: Suit.DIAMOND },
        ],
      ]);
      expect(result.current.piles).toStrictEqual([[], [], []]);
      expect(result.current.sharedStack).toStrictEqual([]);

      expect(mockPreviousPlayerAction.previousPlayer).toBe(1);
      expect(mockPreviousPlayerAction.previousAction).toBe(Action.DISCARD);
      expect(result.current.nextPlayers).toStrictEqual([false, true, false]);
      expect(result.current.nextAction).toBe(Action.CUT_FOR_STARTER);
      // expect(roundHook.current.previousCardPlayedBy).toBeNull;
      expect(result.current.isCurrentPlayOver).toBeNull;
    });
  });

  describe("revealing starter", () => {
    test("first cut", () => {
      act(() => result.current.deal());
      rerender({ ...initialProps });
      act(() => result.current.discardToCrib(2, [2]));
      act(() => result.current.discardToCrib(0, [3]));
      act(() => result.current.discardToCrib(1, [4]));
      act(() => result.current.cut());
      rerender({ ...initialProps });

      expect(result.current.starter).toBeNull;
      expect(result.current.crib).toStrictEqual([
        { rank: Rank.FIVE, suit: Suit.DIAMOND },
        { rank: Rank.SIX, suit: Suit.SPADE },
        { rank: Rank.JACK, suit: Suit.DIAMOND },
        { rank: Rank.QUEEN, suit: Suit.HEART },
      ]);
      expect(
        result.current.hands.map((hand) => hand.sort(cardSorter))
      ).toStrictEqual([
        [
          { rank: Rank.THREE, suit: Suit.HEART },
          { rank: Rank.FIVE, suit: Suit.CLUB },
          { rank: Rank.FIVE, suit: Suit.HEART },
          { rank: Rank.KING, suit: Suit.CLUB },
        ],
        [
          { rank: Rank.ACE, suit: Suit.DIAMOND },
          { rank: Rank.TWO, suit: Suit.HEART },
          { rank: Rank.TEN, suit: Suit.SPADE },
          { rank: Rank.JACK, suit: Suit.CLUB },
        ],
        [
          { rank: Rank.FIVE, suit: Suit.SPADE },
          { rank: Rank.NINE, suit: Suit.HEART },
          { rank: Rank.JACK, suit: Suit.HEART },
          { rank: Rank.QUEEN, suit: Suit.DIAMOND },
        ],
      ]);
      expect(result.current.piles).toStrictEqual([[], [], []]);
      expect(result.current.sharedStack).toStrictEqual([]);

      expect(mockPreviousPlayerAction.previousPlayer).toBe(1);
      expect(mockPreviousPlayerAction.previousAction).toBe(
        Action.CUT_FOR_STARTER
      );
      expect(result.current.nextPlayers).toStrictEqual([false, false, true]);
      expect(result.current.nextAction).toBe(Action.FLIP_STARTER);
      // expect(roundHook.current.previousCardPlayedBy).toBeNull;
      expect(result.current.isCurrentPlayOver).toBeNull;
    });

    test("then flip", () => {
      act(() => result.current.deal());
      rerender({ ...initialProps });
      act(() => result.current.discardToCrib(2, [2]));
      act(() => result.current.discardToCrib(0, [3]));
      act(() => result.current.discardToCrib(1, [4]));
      act(() => result.current.cut());
      rerender({ ...initialProps });
      act(() => result.current.flip());

      expect(result.current.starter).toStrictEqual(starter);
      expect(result.current.crib).toStrictEqual([
        { rank: Rank.FIVE, suit: Suit.DIAMOND },
        { rank: Rank.SIX, suit: Suit.SPADE },
        { rank: Rank.JACK, suit: Suit.DIAMOND },
        { rank: Rank.QUEEN, suit: Suit.HEART },
      ]);
      expect(
        result.current.hands.map((hand) => hand.sort(cardSorter))
      ).toStrictEqual([
        [
          { rank: Rank.THREE, suit: Suit.HEART },
          { rank: Rank.FIVE, suit: Suit.CLUB },
          { rank: Rank.FIVE, suit: Suit.HEART },
          { rank: Rank.KING, suit: Suit.CLUB },
        ],
        [
          { rank: Rank.ACE, suit: Suit.DIAMOND },
          { rank: Rank.TWO, suit: Suit.HEART },
          { rank: Rank.TEN, suit: Suit.SPADE },
          { rank: Rank.JACK, suit: Suit.CLUB },
        ],
        [
          { rank: Rank.FIVE, suit: Suit.SPADE },
          { rank: Rank.NINE, suit: Suit.HEART },
          { rank: Rank.JACK, suit: Suit.HEART },
          { rank: Rank.QUEEN, suit: Suit.DIAMOND },
        ],
      ]);
      expect(result.current.piles).toStrictEqual([[], [], []]);
      expect(result.current.sharedStack).toStrictEqual([]);

      expect(mockPreviousPlayerAction.previousPlayer).toBe(dealer);
      expect(mockPreviousPlayerAction.previousAction).toBe(Action.FLIP_STARTER);
      expect(result.current.nextPlayers).toStrictEqual([true, false, false]);
      expect(result.current.nextAction).toBe(Action.PLAY_OR_GO);
      // expect(roundHook.current.previousCardPlayedBy).toBeNull;
      expect(result.current.isCurrentPlayOver).toBe(false);
    });
  });

  describe("opening play stage", () => {
    test("check opening play/go", () => {
      act(() => result.current.deal());
      rerender({ ...initialProps });
      act(() => result.current.discardToCrib(2, [2]));
      act(() => result.current.discardToCrib(0, [3]));
      act(() => result.current.discardToCrib(1, [4]));
      act(() => result.current.cut());
      rerender({ ...initialProps });
      act(() => result.current.flip());

      expect(result.current.isValidPlay(0)).toBe(true); // 3
      expect(result.current.isValidPlay(1)).toBe(true); // 5
      expect(result.current.isValidPlay(2)).toBe(true); // 5
      expect(result.current.isValidPlay(3)).toBe(true); // K
      expect(result.current.isValidGo()).toBe(false);
    });

    test("opening play", () => {
      act(() => result.current.deal());
      rerender({ ...initialProps });
      act(() => result.current.discardToCrib(2, [2]));
      act(() => result.current.discardToCrib(0, [3]));
      act(() => result.current.discardToCrib(1, [4]));
      act(() => result.current.cut());
      rerender({ ...initialProps });
      act(() => result.current.flip());

      act(() => result.current.play(2)); // 0 plays 5H

      expect(result.current.starter).toStrictEqual(starter);
      expect(result.current.crib).toStrictEqual([
        { rank: Rank.FIVE, suit: Suit.DIAMOND },
        { rank: Rank.SIX, suit: Suit.SPADE },
        { rank: Rank.JACK, suit: Suit.DIAMOND },
        { rank: Rank.QUEEN, suit: Suit.HEART },
      ]);
      expect(
        result.current.hands.map((hand) => hand.sort(cardSorter))
      ).toStrictEqual([
        [
          { rank: Rank.THREE, suit: Suit.HEART },
          { rank: Rank.FIVE, suit: Suit.CLUB },
          { rank: Rank.KING, suit: Suit.CLUB },
        ],
        [
          { rank: Rank.ACE, suit: Suit.DIAMOND },
          { rank: Rank.TWO, suit: Suit.HEART },
          { rank: Rank.TEN, suit: Suit.SPADE },
          { rank: Rank.JACK, suit: Suit.CLUB },
        ],
        [
          { rank: Rank.FIVE, suit: Suit.SPADE },
          { rank: Rank.NINE, suit: Suit.HEART },
          { rank: Rank.JACK, suit: Suit.HEART },
          { rank: Rank.QUEEN, suit: Suit.DIAMOND },
        ],
      ]);
      expect(result.current.piles).toStrictEqual([
        [{ rank: Rank.FIVE, suit: Suit.HEART }],
        [],
        [],
      ]);
      expect(result.current.sharedStack).toStrictEqual([
        { rank: Rank.FIVE, suit: Suit.HEART },
      ]);

      expect(mockPreviousPlayerAction.previousPlayer).toBe(0);
      expect(mockPreviousPlayerAction.previousAction).toBe(Action.PLAY);
      expect(result.current.nextPlayers).toStrictEqual([false, true, false]);
      expect(result.current.nextAction).toBe(Action.PLAY_OR_GO);
      // expect(roundHook.current.previousCardPlayedBy).toBe(0);
      expect(result.current.isCurrentPlayOver).toBe(false);
    });

    test("check follow-up play/go", () => {
      act(() => result.current.deal());
      rerender({ ...initialProps });
      act(() => result.current.discardToCrib(2, [2]));
      act(() => result.current.discardToCrib(0, [3]));
      act(() => result.current.discardToCrib(1, [4]));
      act(() => result.current.cut());
      rerender({ ...initialProps });
      act(() => result.current.flip());
      act(() => result.current.play(2)); // 0 plays 5H

      expect(result.current.isValidPlay(0)).toBe(true); // A
      expect(result.current.isValidPlay(1)).toBe(true); // 2
      expect(result.current.isValidPlay(2)).toBe(true); // J
      expect(result.current.isValidPlay(3)).toBe(true); // Q
      expect(result.current.isValidGo()).toBe(false);
    });

    test("follow-up play", () => {
      act(() => result.current.deal());
      rerender({ ...initialProps });
      act(() => result.current.discardToCrib(2, [2]));
      act(() => result.current.discardToCrib(0, [3]));
      act(() => result.current.discardToCrib(1, [4]));
      act(() => result.current.cut());
      rerender({ ...initialProps });
      act(() => result.current.flip());
      act(() => result.current.play(2)); // 0 plays 5H

      act(() => result.current.play(3)); // 1 plays JC

      expect(result.current.starter).toStrictEqual(starter);
      expect(result.current.crib).toStrictEqual([
        { rank: Rank.FIVE, suit: Suit.DIAMOND },
        { rank: Rank.SIX, suit: Suit.SPADE },
        { rank: Rank.JACK, suit: Suit.DIAMOND },
        { rank: Rank.QUEEN, suit: Suit.HEART },
      ]);
      expect(
        result.current.hands.map((hand) => hand.sort(cardSorter))
      ).toStrictEqual([
        [
          { rank: Rank.THREE, suit: Suit.HEART },
          { rank: Rank.FIVE, suit: Suit.CLUB },
          { rank: Rank.KING, suit: Suit.CLUB },
        ],
        [
          { rank: Rank.ACE, suit: Suit.DIAMOND },
          { rank: Rank.TWO, suit: Suit.HEART },
          { rank: Rank.TEN, suit: Suit.SPADE },
        ],
        [
          { rank: Rank.FIVE, suit: Suit.SPADE },
          { rank: Rank.NINE, suit: Suit.HEART },
          { rank: Rank.JACK, suit: Suit.HEART },
          { rank: Rank.QUEEN, suit: Suit.DIAMOND },
        ],
      ]);
      expect(result.current.piles).toStrictEqual([
        [{ rank: Rank.FIVE, suit: Suit.HEART }],
        [{ rank: Rank.JACK, suit: Suit.CLUB }],
        [],
      ]);
      expect(result.current.sharedStack).toStrictEqual([
        { rank: Rank.FIVE, suit: Suit.HEART },
        { rank: Rank.JACK, suit: Suit.CLUB },
      ]);

      expect(mockPreviousPlayerAction.previousPlayer).toBe(1);
      expect(mockPreviousPlayerAction.previousAction).toBe(Action.PLAY);
      expect(result.current.nextPlayers).toStrictEqual([false, false, true]);
      expect(result.current.nextAction).toBe(Action.PLAY_OR_GO);
      // expect(roundHook.current.previousCardPlayedBy).toBe(1);
      expect(result.current.isCurrentPlayOver).toBe(false);
    });

    test("check 3rd play/go", () => {
      act(() => result.current.deal());
      rerender({ ...initialProps });
      act(() => result.current.discardToCrib(2, [2]));
      act(() => result.current.discardToCrib(0, [3]));
      act(() => result.current.discardToCrib(1, [4]));
      act(() => result.current.cut());
      rerender({ ...initialProps });
      act(() => result.current.flip());
      act(() => result.current.play(2)); // 0 plays 5H
      act(() => result.current.play(3)); // 1 plays JC

      expect(result.current.isValidPlay(0)).toBe(true); // 5S
      expect(result.current.isValidPlay(1)).toBe(true); // 9H
      expect(result.current.isValidPlay(2)).toBe(true); // JH
      expect(result.current.isValidPlay(3)).toBe(true); // JD
      expect(result.current.isValidGo()).toBe(false);
    });

    test("3rd play", () => {
      act(() => result.current.deal());
      rerender({ ...initialProps });
      act(() => result.current.discardToCrib(2, [2]));
      act(() => result.current.discardToCrib(0, [3]));
      act(() => result.current.discardToCrib(1, [4]));
      act(() => result.current.cut());
      rerender({ ...initialProps });
      act(() => result.current.flip());
      act(() => result.current.play(2)); // 0 plays 5H
      act(() => result.current.play(3)); // 1 plays JC

      act(() => result.current.play(0)); // 2 plays 5S

      expect(result.current.starter).toStrictEqual(starter);
      expect(result.current.crib).toStrictEqual([
        { rank: Rank.FIVE, suit: Suit.DIAMOND },
        { rank: Rank.SIX, suit: Suit.SPADE },
        { rank: Rank.JACK, suit: Suit.DIAMOND },
        { rank: Rank.QUEEN, suit: Suit.HEART },
      ]);
      expect(
        result.current.hands.map((hand) => hand.sort(cardSorter))
      ).toStrictEqual([
        [
          { rank: Rank.THREE, suit: Suit.HEART },
          { rank: Rank.FIVE, suit: Suit.CLUB },
          { rank: Rank.KING, suit: Suit.CLUB },
        ],
        [
          { rank: Rank.ACE, suit: Suit.DIAMOND },
          { rank: Rank.TWO, suit: Suit.HEART },
          { rank: Rank.TEN, suit: Suit.SPADE },
        ],
        [
          { rank: Rank.NINE, suit: Suit.HEART },
          { rank: Rank.JACK, suit: Suit.HEART },
          { rank: Rank.QUEEN, suit: Suit.DIAMOND },
        ],
      ]);
      expect(result.current.piles).toStrictEqual([
        [{ rank: Rank.FIVE, suit: Suit.HEART }],
        [{ rank: Rank.JACK, suit: Suit.CLUB }],
        [{ rank: Rank.FIVE, suit: Suit.SPADE }],
      ]);
      expect(result.current.sharedStack).toStrictEqual([
        { rank: Rank.FIVE, suit: Suit.HEART },
        { rank: Rank.JACK, suit: Suit.CLUB },
        { rank: Rank.FIVE, suit: Suit.SPADE },
      ]);

      expect(mockPreviousPlayerAction.previousPlayer).toBe(2);
      expect(mockPreviousPlayerAction.previousAction).toBe(Action.PLAY);
      expect(result.current.nextPlayers).toStrictEqual([true, false, false]);
      expect(result.current.nextAction).toBe(Action.PLAY_OR_GO);
      // expect(roundHook.current.previousCardPlayedBy).toBe(2);
      expect(result.current.isCurrentPlayOver).toBe(false);
    });
  });

  describe("playing full play stage", () => {
    test("full play stage", () => {
      act(() => result.current.deal());
      rerender({ ...initialProps });
      act(() => result.current.discardToCrib(2, [2]));
      act(() => result.current.discardToCrib(0, [3]));
      act(() => result.current.discardToCrib(1, [4]));
      act(() => result.current.cut());
      rerender({ ...initialProps });
      act(() => result.current.flip());

      // 0 plays K: K -> 10
      expect(result.current.isValidGo()).toBe(false);
      expect(result.current.isValidPlay(3)).toBe(true);
      act(() => result.current.play(3));
      expect(result.current.sharedStack).toStrictEqual([
        { rank: Rank.KING, suit: Suit.CLUB },
      ]);
      expect(result.current.nextPlayers).toStrictEqual([false, true, false]);
      expect(result.current.nextAction).toBe(Action.PLAY_OR_GO);
      // expect(roundHook.current.previousCardPlayedBy).toBe(0);
      expect(result.current.isCurrentPlayOver).toBe(false);

      // 1 plays J: K, J -> 20
      expect(result.current.isValidGo()).toBe(false);
      expect(result.current.isValidPlay(3)).toBe(true);
      act(() => result.current.play(3));
      expect(result.current.sharedStack).toStrictEqual([
        { rank: Rank.KING, suit: Suit.CLUB },
        { rank: Rank.JACK, suit: Suit.CLUB },
      ]);
      expect(result.current.nextPlayers).toStrictEqual([false, false, true]);
      expect(result.current.nextAction).toBe(Action.PLAY_OR_GO);
      // expect(roundHook.current.previousCardPlayedBy).toBe(1);
      expect(result.current.isCurrentPlayOver).toBe(false);

      // 2 plays Q: K, J, Q -> 30
      expect(result.current.isValidGo()).toBe(false);
      expect(result.current.isValidPlay(3)).toBe(true);
      act(() => result.current.play(3));
      expect(result.current.sharedStack).toStrictEqual([
        { rank: Rank.KING, suit: Suit.CLUB },
        { rank: Rank.JACK, suit: Suit.CLUB },
        { rank: Rank.QUEEN, suit: Suit.DIAMOND },
      ]);
      expect(mockPreviousPlayerAction.previousAction).toBe(Action.PLAY);
      expect(result.current.nextPlayers).toStrictEqual([true, false, false]);
      expect(result.current.nextAction).toBe(Action.PLAY_OR_GO);
      // expect(roundHook.current.previousCardPlayedBy).toBe(2);
      expect(result.current.isCurrentPlayOver).toBe(false);

      // 0 can't play
      expect(result.current.isValidPlay(0)).toBe(false);
      expect(result.current.isValidPlay(1)).toBe(false);
      expect(result.current.isValidPlay(2)).toBe(false);
      expect(result.current.isValidGo()).toBe(true);
      act(() => result.current.go());
      expect(result.current.sharedStack).toStrictEqual([
        { rank: Rank.KING, suit: Suit.CLUB },
        { rank: Rank.JACK, suit: Suit.CLUB },
        { rank: Rank.QUEEN, suit: Suit.DIAMOND },
      ]);
      expect(mockPreviousPlayerAction.previousAction).toBe(Action.GO);
      expect(result.current.nextPlayers).toStrictEqual([false, true, false]);
      expect(result.current.nextAction).toBe(Action.PLAY_OR_GO);
      // expect(roundHook.current.previousCardPlayedBy).toBe(2);
      expect(result.current.isCurrentPlayOver).toBe(false);

      // 1 must play A: K, J, Q, A -> 31
      expect(result.current.isValidPlay(0)).toBe(true);
      expect(result.current.isValidPlay(1)).toBe(false);
      expect(result.current.isValidPlay(2)).toBe(false);
      expect(result.current.isValidGo()).toBe(false);
      act(() => result.current.play(0));
      expect(result.current.sharedStack).toStrictEqual([
        { rank: Rank.KING, suit: Suit.CLUB },
        { rank: Rank.JACK, suit: Suit.CLUB },
        { rank: Rank.QUEEN, suit: Suit.DIAMOND },
        { rank: Rank.ACE, suit: Suit.DIAMOND },
      ]);
      expect(mockPreviousPlayerAction.previousAction).toBe(Action.PLAY);
      expect(result.current.nextPlayers).toStrictEqual([false, false, true]);
      expect(result.current.nextAction).toBe(Action.FLIP_PLAYED_CARDS);
      // expect(roundHook.current.previousCardPlayedBy).toBe(1);
      expect(result.current.isCurrentPlayOver).toBe(true);

      // 2 ends current play
      act(() => result.current.endPlay());
      expect(result.current.sharedStack).toStrictEqual([]);
      expect(mockPreviousPlayerAction.previousAction).toBe(
        Action.FLIP_PLAYED_CARDS
      );
      expect(result.current.nextPlayers).toStrictEqual([false, false, true]);
      expect(result.current.nextAction).toBe(Action.PLAY_OR_GO);
      // expect(roundHook.current.previousCardPlayedBy).toBeNull;
      expect(result.current.isCurrentPlayOver).toBe(false);

      // 2 plays J: J -> 10
      expect(result.current.isValidGo()).toBe(false);
      expect(result.current.isValidPlay(2)).toBe(true);
      act(() => result.current.play(2));
      expect(result.current.sharedStack).toStrictEqual([
        { rank: Rank.JACK, suit: Suit.HEART },
      ]);
      expect(mockPreviousPlayerAction.previousAction).toBe(Action.PLAY);
      expect(result.current.nextPlayers).toStrictEqual([true, false, false]);
      expect(result.current.nextAction).toBe(Action.PLAY_OR_GO);
      // expect(roundHook.current.previousCardPlayedBy).toBe(2);
      expect(result.current.isCurrentPlayOver).toBe(false);

      // 0 plays 5 for 15: J, 5 -> 15
      expect(result.current.isValidGo()).toBe(false);
      expect(result.current.isValidPlay(1)).toBe(true);
      act(() => result.current.play(1));
      expect(result.current.sharedStack).toStrictEqual([
        { rank: Rank.JACK, suit: Suit.HEART },
        { rank: Rank.FIVE, suit: Suit.CLUB },
      ]);
      expect(mockPreviousPlayerAction.previousAction).toBe(Action.PLAY);
      expect(result.current.nextPlayers).toStrictEqual([false, true, false]);
      expect(result.current.nextAction).toBe(Action.PLAY_OR_GO);
      // expect(roundHook.current.previousCardPlayedBy).toBe(0);
      expect(result.current.isCurrentPlayOver).toBe(false);

      // 1 plays 10: J, 5, 10 -> 25
      expect(result.current.isValidGo()).toBe(false);
      expect(result.current.isValidPlay(1)).toBe(true);
      act(() => result.current.play(1));

      // 2 must play 5: J, 5, 10, 5 -> 30
      expect(result.current.isValidGo()).toBe(false);
      expect(result.current.isValidPlay(1)).toBe(false);
      expect(result.current.isValidPlay(0)).toBe(true);
      act(() => result.current.play(0));
      expect(mockPreviousPlayerAction.previousAction).toBe(Action.PLAY);
      expect(result.current.nextPlayers).toStrictEqual([true, false, false]);
      expect(result.current.nextAction).toBe(Action.PLAY_OR_GO);
      // expect(roundHook.current.previousCardPlayedBy).toBe(2);
      expect(result.current.isCurrentPlayOver).toBe(false);

      // 0, 1, 2 must go
      expect(result.current.isValidGo()).toBe(true);
      expect(result.current.isValidPlay(0)).toBe(false);
      act(() => result.current.go());
      expect(mockPreviousPlayerAction.previousAction).toBe(Action.GO);
      expect(result.current.nextPlayers).toStrictEqual([false, true, false]);
      expect(result.current.nextAction).toBe(Action.PLAY_OR_GO);
      // expect(roundHook.current.previousCardPlayedBy).toBe(2);
      expect(result.current.isCurrentPlayOver).toBe(false);

      expect(result.current.isValidGo()).toBe(true);
      expect(result.current.isValidPlay(0)).toBe(false);
      act(() => result.current.go());
      expect(mockPreviousPlayerAction.previousAction).toBe(Action.GO);
      expect(result.current.nextPlayers).toStrictEqual([false, false, true]);
      expect(result.current.nextAction).toBe(Action.PLAY_OR_GO);
      // expect(roundHook.current.previousCardPlayedBy).toBe(2);
      expect(result.current.isCurrentPlayOver).toBe(false);

      expect(result.current.isValidGo()).toBe(true);
      expect(result.current.isValidPlay(0)).toBe(false);
      act(() => result.current.go());
      expect(mockPreviousPlayerAction.previousAction).toBe(Action.GO);
      expect(result.current.nextPlayers).toStrictEqual([true, false, false]);
      expect(result.current.nextAction).toBe(Action.FLIP_PLAYED_CARDS);
      // expect(roundHook.current.previousCardPlayedBy).toBe(2);
      expect(result.current.isCurrentPlayOver).toBe(true);

      // 0 restarts
      act(() => result.current.endPlay());
      expect(mockPreviousPlayerAction.previousAction).toBe(
        Action.FLIP_PLAYED_CARDS
      );
      expect(result.current.nextPlayers).toStrictEqual([true, false, false]);
      expect(result.current.nextAction).toBe(Action.PLAY_OR_GO);
      // expect(roundHook.current.previousCardPlayedBy).toBe(null);
      expect(result.current.isCurrentPlayOver).toBe(false);

      // ... etc., play remaining cards
      expect(result.current.isValidPlay(0)).toBe(true);
      act(() => result.current.play(0));

      expect(result.current.isValidPlay(0)).toBe(true);
      act(() => result.current.play(0));

      expect(result.current.isValidPlay(0)).toBe(true);
      act(() => result.current.play(0));
      expect(mockPreviousPlayerAction.previousAction).toBe(Action.PLAY);
      expect(result.current.nextPlayers).toStrictEqual([true, false, false]);
      expect(result.current.nextAction).toBe(Action.PLAY_OR_GO);
      // expect(roundHook.current.previousCardPlayedBy).toBe(2);
      expect(result.current.isCurrentPlayOver).toBe(false);

      expect(result.current.isValidPlay(0)).toBe(true);
      act(() => result.current.play(0));
      expect(mockPreviousPlayerAction.previousAction).toBe(Action.PLAY);
      expect(result.current.nextPlayers).toStrictEqual([false, false, true]);
      expect(result.current.nextAction).toBe(Action.RETURN_CARDS_TO_HANDS);
      // expect(roundHook.current.previousCardPlayedBy).toBe(0);
      expect(result.current.isCurrentPlayOver).toBe(true);
    });
  });

  describe("return cards to hand and score them", () => {
    test("first return cards", () => {
      act(() => result.current.deal());
      rerender({ ...initialProps });
      act(() => result.current.discardToCrib(1, [4]));
      act(() => result.current.discardToCrib(0, [3]));
      act(() => result.current.discardToCrib(2, [2]));
      act(() => result.current.cut());
      rerender({ ...initialProps });
      act(() => result.current.flip());
      // 0 plays K: K -> 10
      act(() => result.current.play(3));
      // 1 plays J: K, J -> 20
      act(() => result.current.play(3));
      // 2 plays Q: K, J, Q -> 30
      act(() => result.current.play(3));
      // 0 can't play
      act(() => result.current.go());
      // 1 must play A -> 31
      act(() => result.current.play(0));
      // start fresh play with 2
      act(() => result.current.endPlay());
      // 2 plays J: J -> 10
      act(() => result.current.play(2));
      // 0 plays 5 for 15: J, 5 -> 15
      act(() => result.current.play(1));
      // 1 plays 10: J, 5, 10 -> 25
      act(() => result.current.play(1));
      // 2 must play 5: J, 5, 10, 5 -> 30
      act(() => result.current.play(0));
      // 0, 1, 2 must go
      act(() => result.current.go());
      act(() => result.current.go());
      act(() => result.current.go());
      // etc
      act(() => result.current.endPlay());
      act(() => result.current.play(0));
      act(() => result.current.play(0));
      act(() => result.current.play(0));
      act(() => result.current.play(0));

      act(() => result.current.returnToHand());

      expect(result.current.starter).toStrictEqual(starter);
      expect(result.current.crib).toStrictEqual([
        { rank: Rank.FIVE, suit: Suit.DIAMOND },
        { rank: Rank.SIX, suit: Suit.SPADE },
        { rank: Rank.JACK, suit: Suit.DIAMOND },
        { rank: Rank.QUEEN, suit: Suit.HEART },
      ]);
      expect(
        result.current.hands.map((hand) => hand.sort(cardSorter))
      ).toStrictEqual([
        [
          { rank: Rank.THREE, suit: Suit.HEART },
          { rank: Rank.FIVE, suit: Suit.CLUB },
          { rank: Rank.FIVE, suit: Suit.HEART },
          { rank: Rank.KING, suit: Suit.CLUB },
        ],
        [
          { rank: Rank.ACE, suit: Suit.DIAMOND },
          { rank: Rank.TWO, suit: Suit.HEART },
          { rank: Rank.TEN, suit: Suit.SPADE },
          { rank: Rank.JACK, suit: Suit.CLUB },
        ],
        [
          { rank: Rank.FIVE, suit: Suit.SPADE },
          { rank: Rank.NINE, suit: Suit.HEART },
          { rank: Rank.JACK, suit: Suit.HEART },
          { rank: Rank.QUEEN, suit: Suit.DIAMOND },
        ],
      ]);
      expect(result.current.piles).toStrictEqual([[], [], []]);
      expect(result.current.sharedStack).toStrictEqual([]);

      expect(mockPreviousPlayerAction.previousPlayer).toBe(dealer);
      expect(mockPreviousPlayerAction.previousAction).toBe(
        Action.RETURN_CARDS_TO_HANDS
      );
      expect(result.current.nextPlayers).toStrictEqual([true, false, false]);
      expect(result.current.nextAction).toBe(Action.SCORE_HAND);
      // expect(roundHook.current.previousCardPlayedBy).toBeNull;
      expect(result.current.isCurrentPlayOver).toBeNull;
    });

    test("then score all hands", () => {
      act(() => result.current.deal());
      rerender({ ...initialProps });
      act(() => result.current.discardToCrib(1, [4]));
      act(() => result.current.discardToCrib(0, [3]));
      act(() => result.current.discardToCrib(2, [2]));
      act(() => result.current.cut());
      rerender({ ...initialProps });
      act(() => result.current.flip());
      // 0 plays K: K -> 10
      act(() => result.current.play(3));
      // 1 plays J: K, J -> 20
      act(() => result.current.play(3));
      // 2 plays Q: K, J, Q -> 30
      act(() => result.current.play(3));
      // 0 can't play
      act(() => result.current.go());
      // 1 must play A -> 31
      act(() => result.current.play(0));
      // start fresh play with 2
      act(() => result.current.endPlay());
      // 2 plays J: J -> 10
      act(() => result.current.play(2));
      // 0 plays 5 for 15: J, 5 -> 15
      act(() => result.current.play(1));
      // 1 plays 10: J, 5, 10 -> 25
      act(() => result.current.play(1));
      // 2 must play 5: J, 5, 10, 5 -> 30
      act(() => result.current.play(0));
      // 0, 1, 2 must go
      act(() => result.current.go());
      act(() => result.current.go());
      act(() => result.current.go());
      // etc
      act(() => result.current.endPlay());
      act(() => result.current.play(0));
      act(() => result.current.play(0));
      act(() => result.current.play(0));
      act(() => result.current.play(0));
      act(() => result.current.returnToHand());

      act(() => result.current.scoreHand());
      rerender({ ...initialProps });

      expect(result.current.starter).toStrictEqual(starter);
      expect(result.current.crib).toStrictEqual([
        { rank: Rank.FIVE, suit: Suit.DIAMOND },
        { rank: Rank.SIX, suit: Suit.SPADE },
        { rank: Rank.JACK, suit: Suit.DIAMOND },
        { rank: Rank.QUEEN, suit: Suit.HEART },
      ]);
      expect(
        result.current.hands.map((hand) => hand.sort(cardSorter))
      ).toStrictEqual([
        [
          { rank: Rank.THREE, suit: Suit.HEART },
          { rank: Rank.FIVE, suit: Suit.CLUB },
          { rank: Rank.FIVE, suit: Suit.HEART },
          { rank: Rank.KING, suit: Suit.CLUB },
        ],
        [
          { rank: Rank.ACE, suit: Suit.DIAMOND },
          { rank: Rank.TWO, suit: Suit.HEART },
          { rank: Rank.TEN, suit: Suit.SPADE },
          { rank: Rank.JACK, suit: Suit.CLUB },
        ],
        [
          { rank: Rank.FIVE, suit: Suit.SPADE },
          { rank: Rank.NINE, suit: Suit.HEART },
          { rank: Rank.JACK, suit: Suit.HEART },
          { rank: Rank.QUEEN, suit: Suit.DIAMOND },
        ],
      ]);
      expect(result.current.piles).toStrictEqual([[], [], []]);
      expect(result.current.sharedStack).toStrictEqual([]);

      expect(mockPreviousPlayerAction.previousPlayer).toBe(0);
      expect(mockPreviousPlayerAction.previousAction).toBe(Action.SCORE_HAND);
      expect(result.current.nextPlayers).toStrictEqual([false, true, false]);
      expect(result.current.nextAction).toBe(Action.SCORE_HAND);
      // expect(roundHook.current.previousCardPlayedBy).toBeNull;
      expect(result.current.isCurrentPlayOver).toBeNull;

      act(() => result.current.scoreHand());
      rerender({ ...initialProps });
      act(() => result.current.scoreHand());
      rerender({ ...initialProps });

      expect(mockPreviousPlayerAction.previousPlayer).toBe(2);
      expect(mockPreviousPlayerAction.previousAction).toBe(Action.SCORE_HAND);
      expect(result.current.nextPlayers).toStrictEqual([false, false, true]);
      expect(result.current.nextAction).toBe(Action.SCORE_CRIB);
      // expect(roundHook.current.previousCardPlayedBy).toBeNull;
      expect(result.current.isCurrentPlayOver).toBeNull;

      act(() => result.current.scoreCrib());
      rerender({ ...initialProps });

      expect(mockPreviousPlayerAction.previousPlayer).toBe(2);
      expect(mockPreviousPlayerAction.previousAction).toBe(Action.SCORE_CRIB);
      expect(result.current.nextPlayers).toBeNull;
      expect(result.current.nextAction).toBeNull;
      // expect(roundHook.current.previousCardPlayedBy).toBeNull;
      expect(result.current.isCurrentPlayOver).toBeNull;
    });
  });

  describe("resetting the round", () => {
    test("reset", () => {
      act(() => result.current.deal());
      rerender({ ...initialProps });
      act(() => result.current.discardToCrib(1, [4]));
      act(() => result.current.discardToCrib(0, [3]));
      act(() => result.current.discardToCrib(2, [2]));
      act(() => result.current.cut());
      rerender({ ...initialProps });
      act(() => result.current.flip());
      // 0 plays K: K -> 10
      act(() => result.current.play(3));
      // 1 plays J: K, J -> 20
      act(() => result.current.play(3));
      // 2 plays Q: K, J, Q -> 30
      act(() => result.current.play(3));
      // 0 can't play
      act(() => result.current.go());
      // 1 must play A -> 31
      act(() => result.current.play(0));
      // start fresh play with 2
      act(() => result.current.endPlay());
      // 2 plays J: J -> 10
      act(() => result.current.play(2));
      // 0 plays 5 for 15: J, 5 -> 15
      act(() => result.current.play(1));
      // 1 plays 10: J, 5, 10 -> 25
      act(() => result.current.play(1));
      // 2 must play 5: J, 5, 10, 5 -> 30
      act(() => result.current.play(0));
      // 0, 1, 2 must go
      act(() => result.current.go());
      act(() => result.current.go());
      act(() => result.current.go());
      // etc
      act(() => result.current.endPlay());
      act(() => result.current.play(0));
      act(() => result.current.play(0));
      act(() => result.current.play(0));
      act(() => result.current.play(0));
      act(() => result.current.returnToHand());
      act(() => result.current.scoreHand());
      rerender({ ...initialProps });
      act(() => result.current.scoreHand());
      rerender({ ...initialProps });
      act(() => result.current.scoreHand());
      rerender({ ...initialProps });
      act(() => result.current.scoreCrib());
      rerender({ ...initialProps });

      dealer = 0;

      act(() => result.current.reset());

      // copied from first test
      expect(result.current.starter).toBeNull;
      expect(result.current.crib).toStrictEqual([]);
      expect(result.current.hands).toStrictEqual([[], [], []]);
      expect(result.current.piles).toStrictEqual([[], [], []]);
      expect(result.current.sharedStack).toStrictEqual([]);

      expect(mockPreviousPlayerAction.previousPlayer).toBeNull;
      expect(mockPreviousPlayerAction.previousAction).toBeNull;
      expect(result.current.nextPlayers).toStrictEqual([false, false, true]);
      expect(result.current.nextAction).toBe(Action.START_DEALING);
      // expect(roundHook.current.previousCardPlayedBy).toBeNull;
      expect(result.current.isCurrentPlayOver).toBeNull;
    });
  });
});

// NOTE: could test everything automatically resets on playerCount change

// import { render } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react-hooks";

import { useRound } from "./useRound.js";

import Rank from "./../playing-cards/Rank.js";
import Suit from "./../playing-cards/Suit.js";
import Action from "./Action.js";
import { cardSorter } from "../playing-cards/cardHelpers.js";

//// Setup ////

// QUESTION: how to preserve the hook state between tests, to avoid dealing etc at the start of each test?
// nothing I've tried works

// mock values to reset each test
let mockCards;
let roundHook;

// the starter in all tests (when not null)
const starter = {
  rank: Rank.TEN,
  suit: Suit.DIAMOND,
};

// fixed params for the hook
const deckHook = {
  draw: () => [mockCards.pop()],
  cut: () => null,
  uncut: () => null,
};
const playerCount = 3;
const dealer = 2;

beforeEach(() => {
  mockCards = [
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
  roundHook = renderHook(() => useRound(deckHook, playerCount, dealer)).result;
});

//// Tests ////

// TODO: NEXT: NEXT: retry maintaining state between tests

describe("run through a round", () => {
  describe("start", () => {
    test("initial state", () => {
      expect(roundHook.current.starter).toBeNull;
      expect(roundHook.current.crib).toStrictEqual([]);
      expect(roundHook.current.hands).toStrictEqual([[], [], []]);
      expect(roundHook.current.piles).toStrictEqual([[], [], []]);
      expect(roundHook.current.sharedStack).toStrictEqual([]);

      expect(roundHook.current.previousPlayer).toBeNull;
      expect(roundHook.current.previousAction).toBeNull;
      expect(roundHook.current.nextPlayers).toStrictEqual([false, false, true]);
      expect(roundHook.current.nextAction).toBe(Action.START_DEALING);
      expect(roundHook.current.previousCardPlayedBy).toBeNull;
      expect(roundHook.current.isCurrentPlayOver).toBe(false);
    });
  });

  describe("dealing", () => {
    test("deal", () => {
      act(() => roundHook.current.deal());

      expect(roundHook.current.starter).toBeNull;
      expect(roundHook.current.crib).toStrictEqual([
        { rank: Rank.FIVE, suit: Suit.DIAMOND },
      ]);
      expect(
        roundHook.current.hands.map((hand) => hand.sort(cardSorter))
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
      expect(roundHook.current.piles).toStrictEqual([[], [], []]);
      expect(roundHook.current.sharedStack).toStrictEqual([]);

      expect(roundHook.current.previousPlayer).toBe(dealer);
      expect(roundHook.current.previousAction).toBe(Action.CONTINUE_DEALING);
      expect(roundHook.current.nextPlayers).toStrictEqual([true, true, true]);
      expect(roundHook.current.nextAction).toBe(Action.DISCARD);
      expect(roundHook.current.previousCardPlayedBy).toBeNull;
      expect(roundHook.current.isCurrentPlayOver).toBe(false);
    });
  });

  describe("discarding", () => {
    test("first player 2", () => {
      act(() => roundHook.current.deal());
      act(() => roundHook.current.discardToCrib(2, [2]));

      expect(roundHook.current.starter).toBeNull;
      expect(roundHook.current.crib).toStrictEqual([
        { rank: Rank.FIVE, suit: Suit.DIAMOND },
        { rank: Rank.JACK, suit: Suit.DIAMOND },
      ]);
      expect(
        roundHook.current.hands.map((hand) => hand.sort(cardSorter))
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
      expect(roundHook.current.piles).toStrictEqual([[], [], []]);
      expect(roundHook.current.sharedStack).toStrictEqual([]);

      expect(roundHook.current.previousPlayer).toBe(2);
      expect(roundHook.current.previousAction).toBe(Action.DISCARD);
      expect(roundHook.current.nextPlayers).toStrictEqual([true, true, false]);
      expect(roundHook.current.nextAction).toBe(Action.DISCARD);
      expect(roundHook.current.previousCardPlayedBy).toBeNull;
      expect(roundHook.current.isCurrentPlayOver).toBe(false);
    });

    test("then player 0", () => {
      act(() => roundHook.current.deal());
      act(() => roundHook.current.discardToCrib(2, [2]));
      act(() => roundHook.current.discardToCrib(0, [3]));

      expect(roundHook.current.starter).toBeNull;
      expect(roundHook.current.crib).toStrictEqual([
        { rank: Rank.FIVE, suit: Suit.DIAMOND },
        { rank: Rank.SIX, suit: Suit.SPADE },
        { rank: Rank.JACK, suit: Suit.DIAMOND },
      ]);
      expect(
        roundHook.current.hands.map((hand) => hand.sort(cardSorter))
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
      expect(roundHook.current.piles).toStrictEqual([[], [], []]);
      expect(roundHook.current.sharedStack).toStrictEqual([]);

      expect(roundHook.current.previousPlayer).toBe(0);
      expect(roundHook.current.previousAction).toBe(Action.DISCARD);
      expect(roundHook.current.nextPlayers).toStrictEqual([false, true, false]);
      expect(roundHook.current.nextAction).toBe(Action.DISCARD);
      expect(roundHook.current.previousCardPlayedBy).toBeNull;
      expect(roundHook.current.isCurrentPlayOver).toBe(false);
    });

    test("finally player 1", () => {
      act(() => roundHook.current.deal());
      act(() => roundHook.current.discardToCrib(2, [2]));
      act(() => roundHook.current.discardToCrib(0, [3]));
      act(() => roundHook.current.discardToCrib(1, [4]));

      expect(roundHook.current.starter).toBeNull;
      expect(roundHook.current.crib).toStrictEqual([
        { rank: Rank.FIVE, suit: Suit.DIAMOND },
        { rank: Rank.SIX, suit: Suit.SPADE },
        { rank: Rank.JACK, suit: Suit.DIAMOND },
        { rank: Rank.QUEEN, suit: Suit.HEART },
      ]);
      expect(
        roundHook.current.hands.map((hand) => hand.sort(cardSorter))
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
      expect(roundHook.current.piles).toStrictEqual([[], [], []]);
      expect(roundHook.current.sharedStack).toStrictEqual([]);

      expect(roundHook.current.previousPlayer).toBe(1);
      expect(roundHook.current.previousAction).toBe(Action.DISCARD);
      expect(roundHook.current.nextPlayers).toStrictEqual([false, true, false]);
      expect(roundHook.current.nextAction).toBe(Action.CUT_FOR_STARTER);
      expect(roundHook.current.previousCardPlayedBy).toBeNull;
      expect(roundHook.current.isCurrentPlayOver).toBe(false);
    });
  });

  describe("revealing starter", () => {
    test("first cut", () => {
      act(() => roundHook.current.deal());
      act(() => roundHook.current.discardToCrib(2, [2]));
      act(() => roundHook.current.discardToCrib(0, [3]));
      act(() => roundHook.current.discardToCrib(1, [4]));
      act(() => roundHook.current.cut());

      expect(roundHook.current.starter).toBeNull;
      expect(roundHook.current.crib).toStrictEqual([
        { rank: Rank.FIVE, suit: Suit.DIAMOND },
        { rank: Rank.SIX, suit: Suit.SPADE },
        { rank: Rank.JACK, suit: Suit.DIAMOND },
        { rank: Rank.QUEEN, suit: Suit.HEART },
      ]);
      expect(
        roundHook.current.hands.map((hand) => hand.sort(cardSorter))
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
      expect(roundHook.current.piles).toStrictEqual([[], [], []]);
      expect(roundHook.current.sharedStack).toStrictEqual([]);

      expect(roundHook.current.previousPlayer).toBe(1);
      expect(roundHook.current.previousAction).toBe(Action.CUT_FOR_STARTER);
      expect(roundHook.current.nextPlayers).toStrictEqual([false, false, true]);
      expect(roundHook.current.nextAction).toBe(Action.FLIP_STARTER);
      expect(roundHook.current.previousCardPlayedBy).toBeNull;
      expect(roundHook.current.isCurrentPlayOver).toBe(false);
    });

    test("then flip", () => {
      act(() => roundHook.current.deal());
      act(() => roundHook.current.discardToCrib(2, [2]));
      act(() => roundHook.current.discardToCrib(0, [3]));
      act(() => roundHook.current.discardToCrib(1, [4]));
      act(() => roundHook.current.cut());
      act(() => roundHook.current.flip());

      expect(roundHook.current.starter).toStrictEqual(starter);
      expect(roundHook.current.crib).toStrictEqual([
        { rank: Rank.FIVE, suit: Suit.DIAMOND },
        { rank: Rank.SIX, suit: Suit.SPADE },
        { rank: Rank.JACK, suit: Suit.DIAMOND },
        { rank: Rank.QUEEN, suit: Suit.HEART },
      ]);
      expect(
        roundHook.current.hands.map((hand) => hand.sort(cardSorter))
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
      expect(roundHook.current.piles).toStrictEqual([[], [], []]);
      expect(roundHook.current.sharedStack).toStrictEqual([]);

      expect(roundHook.current.previousPlayer).toBe(dealer);
      expect(roundHook.current.previousAction).toBe(Action.FLIP_STARTER);
      expect(roundHook.current.nextPlayers).toStrictEqual([true, false, false]);
      expect(roundHook.current.nextAction).toBe(Action.PLAY_OR_GO);
      expect(roundHook.current.previousCardPlayedBy).toBeNull;
      expect(roundHook.current.isCurrentPlayOver).toBe(false);
    });
  });

  describe("opening play stage", () => {
    test("check opening play/go", () => {
      act(() => roundHook.current.deal());
      act(() => roundHook.current.discardToCrib(2, [2]));
      act(() => roundHook.current.discardToCrib(0, [3]));
      act(() => roundHook.current.discardToCrib(1, [4]));
      act(() => roundHook.current.cut());
      act(() => roundHook.current.flip());

      expect(roundHook.current.isValidPlay(0)).toBe(true); // 3
      expect(roundHook.current.isValidPlay(1)).toBe(true); // 5
      expect(roundHook.current.isValidPlay(2)).toBe(true); // 5
      expect(roundHook.current.isValidPlay(3)).toBe(true); // K
      expect(roundHook.current.isValidGo()).toBe(false);
    });

    test("opening play", () => {
      act(() => roundHook.current.deal());
      act(() => roundHook.current.discardToCrib(2, [2]));
      act(() => roundHook.current.discardToCrib(0, [3]));
      act(() => roundHook.current.discardToCrib(1, [4]));
      act(() => roundHook.current.cut());
      act(() => roundHook.current.flip());

      act(() => roundHook.current.play(2)); // 0 plays 5H

      expect(roundHook.current.starter).toStrictEqual(starter);
      expect(roundHook.current.crib).toStrictEqual([
        { rank: Rank.FIVE, suit: Suit.DIAMOND },
        { rank: Rank.SIX, suit: Suit.SPADE },
        { rank: Rank.JACK, suit: Suit.DIAMOND },
        { rank: Rank.QUEEN, suit: Suit.HEART },
      ]);
      expect(
        roundHook.current.hands.map((hand) => hand.sort(cardSorter))
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
      expect(roundHook.current.piles).toStrictEqual([
        [{ rank: Rank.FIVE, suit: Suit.HEART }],
        [],
        [],
      ]);
      expect(roundHook.current.sharedStack).toStrictEqual([
        { rank: Rank.FIVE, suit: Suit.HEART },
      ]);

      expect(roundHook.current.previousPlayer).toBe(0);
      expect(roundHook.current.previousAction).toBe(Action.PLAY);
      expect(roundHook.current.nextPlayers).toStrictEqual([false, true, false]);
      expect(roundHook.current.nextAction).toBe(Action.PLAY_OR_GO);
      expect(roundHook.current.previousCardPlayedBy).toBe(0);
      expect(roundHook.current.isCurrentPlayOver).toBe(false);
    });

    test("check follow-up play/go", () => {
      act(() => roundHook.current.deal());
      act(() => roundHook.current.discardToCrib(2, [2]));
      act(() => roundHook.current.discardToCrib(0, [3]));
      act(() => roundHook.current.discardToCrib(1, [4]));
      act(() => roundHook.current.cut());
      act(() => roundHook.current.flip());
      act(() => roundHook.current.play(2)); // 0 plays 5H

      expect(roundHook.current.isValidPlay(0)).toBe(true); // A
      expect(roundHook.current.isValidPlay(1)).toBe(true); // 2
      expect(roundHook.current.isValidPlay(2)).toBe(true); // J
      expect(roundHook.current.isValidPlay(3)).toBe(true); // Q
      expect(roundHook.current.isValidGo()).toBe(false);
    });

    test("follow-up play", () => {
      act(() => roundHook.current.deal());
      act(() => roundHook.current.discardToCrib(2, [2]));
      act(() => roundHook.current.discardToCrib(0, [3]));
      act(() => roundHook.current.discardToCrib(1, [4]));
      act(() => roundHook.current.cut());
      act(() => roundHook.current.flip());
      act(() => roundHook.current.play(2)); // 0 plays 5H

      act(() => roundHook.current.play(3)); // 1 plays JC

      expect(roundHook.current.starter).toStrictEqual(starter);
      expect(roundHook.current.crib).toStrictEqual([
        { rank: Rank.FIVE, suit: Suit.DIAMOND },
        { rank: Rank.SIX, suit: Suit.SPADE },
        { rank: Rank.JACK, suit: Suit.DIAMOND },
        { rank: Rank.QUEEN, suit: Suit.HEART },
      ]);
      expect(
        roundHook.current.hands.map((hand) => hand.sort(cardSorter))
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
      expect(roundHook.current.piles).toStrictEqual([
        [{ rank: Rank.FIVE, suit: Suit.HEART }],
        [{ rank: Rank.JACK, suit: Suit.CLUB }],
        [],
      ]);
      expect(roundHook.current.sharedStack).toStrictEqual([
        { rank: Rank.FIVE, suit: Suit.HEART },
        { rank: Rank.JACK, suit: Suit.CLUB },
      ]);

      expect(roundHook.current.previousPlayer).toBe(1);
      expect(roundHook.current.previousAction).toBe(Action.PLAY);
      expect(roundHook.current.nextPlayers).toStrictEqual([false, false, true]);
      expect(roundHook.current.nextAction).toBe(Action.PLAY_OR_GO);
      expect(roundHook.current.previousCardPlayedBy).toBe(1);
      expect(roundHook.current.isCurrentPlayOver).toBe(false);
    });

    test("check 3rd play/go", () => {
      act(() => roundHook.current.deal());
      act(() => roundHook.current.discardToCrib(2, [2]));
      act(() => roundHook.current.discardToCrib(0, [3]));
      act(() => roundHook.current.discardToCrib(1, [4]));
      act(() => roundHook.current.cut());
      act(() => roundHook.current.flip());
      act(() => roundHook.current.play(2)); // 0 plays 5H
      act(() => roundHook.current.play(3)); // 1 plays JC

      expect(roundHook.current.isValidPlay(0)).toBe(true); // 5S
      expect(roundHook.current.isValidPlay(1)).toBe(true); // 9H
      expect(roundHook.current.isValidPlay(2)).toBe(true); // JH
      expect(roundHook.current.isValidPlay(3)).toBe(true); // JD
      expect(roundHook.current.isValidGo()).toBe(false);
    });

    test("3rd play", () => {
      act(() => roundHook.current.deal());
      act(() => roundHook.current.discardToCrib(2, [2]));
      act(() => roundHook.current.discardToCrib(0, [3]));
      act(() => roundHook.current.discardToCrib(1, [4]));
      act(() => roundHook.current.cut());
      act(() => roundHook.current.flip());
      act(() => roundHook.current.play(2)); // 0 plays 5H
      act(() => roundHook.current.play(3)); // 1 plays JC

      act(() => roundHook.current.play(0)); // 2 plays 5S

      expect(roundHook.current.starter).toStrictEqual(starter);
      expect(roundHook.current.crib).toStrictEqual([
        { rank: Rank.FIVE, suit: Suit.DIAMOND },
        { rank: Rank.SIX, suit: Suit.SPADE },
        { rank: Rank.JACK, suit: Suit.DIAMOND },
        { rank: Rank.QUEEN, suit: Suit.HEART },
      ]);
      expect(
        roundHook.current.hands.map((hand) => hand.sort(cardSorter))
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
      expect(roundHook.current.piles).toStrictEqual([
        [{ rank: Rank.FIVE, suit: Suit.HEART }],
        [{ rank: Rank.JACK, suit: Suit.CLUB }],
        [{ rank: Rank.FIVE, suit: Suit.SPADE }],
      ]);
      expect(roundHook.current.sharedStack).toStrictEqual([
        { rank: Rank.FIVE, suit: Suit.HEART },
        { rank: Rank.JACK, suit: Suit.CLUB },
        { rank: Rank.FIVE, suit: Suit.SPADE },
      ]);

      expect(roundHook.current.previousPlayer).toBe(2);
      expect(roundHook.current.previousAction).toBe(Action.PLAY);
      expect(roundHook.current.nextPlayers).toStrictEqual([true, false, false]);
      expect(roundHook.current.nextAction).toBe(Action.PLAY_OR_GO);
      expect(roundHook.current.previousCardPlayedBy).toBe(2);
      expect(roundHook.current.isCurrentPlayOver).toBe(false);
    });
  });

  describe("playing full play stage", () => {
    test("full play stage", () => {
      act(() => roundHook.current.deal());
      act(() => roundHook.current.discardToCrib(2, [2]));
      act(() => roundHook.current.discardToCrib(0, [3]));
      act(() => roundHook.current.discardToCrib(1, [4]));
      act(() => roundHook.current.cut());
      act(() => roundHook.current.flip());

      // 0 plays K: K -> 10
      expect(roundHook.current.isValidGo()).toBe(false);
      expect(roundHook.current.isValidPlay(3)).toBe(true);
      act(() => roundHook.current.play(3));
      expect(roundHook.current.sharedStack).toStrictEqual([
        { rank: Rank.KING, suit: Suit.CLUB },
      ]);
      expect(roundHook.current.nextPlayers).toStrictEqual([false, true, false]);
      expect(roundHook.current.nextAction).toBe(Action.PLAY_OR_GO);
      expect(roundHook.current.previousCardPlayedBy).toBe(0);
      expect(roundHook.current.isCurrentPlayOver).toBe(false);

      // 1 plays J: K, J -> 20
      expect(roundHook.current.isValidGo()).toBe(false);
      expect(roundHook.current.isValidPlay(3)).toBe(true);
      act(() => roundHook.current.play(3));
      expect(roundHook.current.sharedStack).toStrictEqual([
        { rank: Rank.KING, suit: Suit.CLUB },
        { rank: Rank.JACK, suit: Suit.CLUB },
      ]);
      expect(roundHook.current.nextPlayers).toStrictEqual([false, false, true]);
      expect(roundHook.current.nextAction).toBe(Action.PLAY_OR_GO);
      expect(roundHook.current.previousCardPlayedBy).toBe(1);
      expect(roundHook.current.isCurrentPlayOver).toBe(false);

      // 2 plays Q: K, J, Q -> 30
      expect(roundHook.current.isValidGo()).toBe(false);
      expect(roundHook.current.isValidPlay(3)).toBe(true);
      act(() => roundHook.current.play(3));
      expect(roundHook.current.sharedStack).toStrictEqual([
        { rank: Rank.KING, suit: Suit.CLUB },
        { rank: Rank.JACK, suit: Suit.CLUB },
        { rank: Rank.QUEEN, suit: Suit.DIAMOND },
      ]);
      expect(roundHook.current.previousAction).toBe(Action.PLAY);
      expect(roundHook.current.nextPlayers).toStrictEqual([true, false, false]);
      expect(roundHook.current.nextAction).toBe(Action.PLAY_OR_GO);
      expect(roundHook.current.previousCardPlayedBy).toBe(2);
      expect(roundHook.current.isCurrentPlayOver).toBe(false);

      // 0 can't play
      expect(roundHook.current.isValidPlay(0)).toBe(false);
      expect(roundHook.current.isValidPlay(1)).toBe(false);
      expect(roundHook.current.isValidPlay(2)).toBe(false);
      expect(roundHook.current.isValidGo()).toBe(true);
      act(() => roundHook.current.go());
      expect(roundHook.current.sharedStack).toStrictEqual([
        { rank: Rank.KING, suit: Suit.CLUB },
        { rank: Rank.JACK, suit: Suit.CLUB },
        { rank: Rank.QUEEN, suit: Suit.DIAMOND },
      ]);
      expect(roundHook.current.previousAction).toBe(Action.GO);
      expect(roundHook.current.nextPlayers).toStrictEqual([false, true, false]);
      expect(roundHook.current.nextAction).toBe(Action.PLAY_OR_GO);
      expect(roundHook.current.previousCardPlayedBy).toBe(2);
      expect(roundHook.current.isCurrentPlayOver).toBe(false);

      // 1 must play A: K, J, Q, A -> 31
      expect(roundHook.current.isValidPlay(0)).toBe(true);
      expect(roundHook.current.isValidPlay(1)).toBe(false);
      expect(roundHook.current.isValidPlay(2)).toBe(false);
      expect(roundHook.current.isValidGo()).toBe(false);
      act(() => roundHook.current.play(0));
      expect(roundHook.current.sharedStack).toStrictEqual([
        { rank: Rank.KING, suit: Suit.CLUB },
        { rank: Rank.JACK, suit: Suit.CLUB },
        { rank: Rank.QUEEN, suit: Suit.DIAMOND },
        { rank: Rank.ACE, suit: Suit.DIAMOND },
      ]);
      expect(roundHook.current.previousAction).toBe(Action.PLAY);
      expect(roundHook.current.nextPlayers).toStrictEqual([false, false, true]);
      expect(roundHook.current.nextAction).toBe(Action.FLIP_PLAYED_CARDS);
      expect(roundHook.current.previousCardPlayedBy).toBe(1);
      expect(roundHook.current.isCurrentPlayOver).toBe(true);

      // 2 ends current play
      act(() => roundHook.current.endPlay());
      expect(roundHook.current.sharedStack).toStrictEqual([]);
      expect(roundHook.current.previousAction).toBe(Action.FLIP_PLAYED_CARDS);
      expect(roundHook.current.nextPlayers).toStrictEqual([false, false, true]);
      expect(roundHook.current.nextAction).toBe(Action.PLAY_OR_GO);
      expect(roundHook.current.previousCardPlayedBy).toBeNull;
      expect(roundHook.current.isCurrentPlayOver).toBe(false);

      // 2 plays J: J -> 10
      expect(roundHook.current.isValidGo()).toBe(false);
      expect(roundHook.current.isValidPlay(2)).toBe(true);
      act(() => roundHook.current.play(2));
      expect(roundHook.current.sharedStack).toStrictEqual([
        { rank: Rank.JACK, suit: Suit.HEART },
      ]);
      expect(roundHook.current.previousAction).toBe(Action.PLAY);
      expect(roundHook.current.nextPlayers).toStrictEqual([true, false, false]);
      expect(roundHook.current.nextAction).toBe(Action.PLAY_OR_GO);
      expect(roundHook.current.previousCardPlayedBy).toBe(2);
      expect(roundHook.current.isCurrentPlayOver).toBe(false);

      // 0 plays 5 for 15: J, 5 -> 15
      expect(roundHook.current.isValidGo()).toBe(false);
      expect(roundHook.current.isValidPlay(1)).toBe(true);
      act(() => roundHook.current.play(1));
      expect(roundHook.current.sharedStack).toStrictEqual([
        { rank: Rank.JACK, suit: Suit.HEART },
        { rank: Rank.FIVE, suit: Suit.CLUB },
      ]);
      expect(roundHook.current.previousAction).toBe(Action.PLAY);
      expect(roundHook.current.nextPlayers).toStrictEqual([false, true, false]);
      expect(roundHook.current.nextAction).toBe(Action.PLAY_OR_GO);
      expect(roundHook.current.previousCardPlayedBy).toBe(0);
      expect(roundHook.current.isCurrentPlayOver).toBe(false);

      // 1 plays 10: J, 5, 10 -> 25
      expect(roundHook.current.isValidGo()).toBe(false);
      expect(roundHook.current.isValidPlay(1)).toBe(true);
      act(() => roundHook.current.play(1));

      // 2 must play 5: J, 5, 10, 5 -> 30
      expect(roundHook.current.isValidGo()).toBe(false);
      expect(roundHook.current.isValidPlay(1)).toBe(false);
      expect(roundHook.current.isValidPlay(0)).toBe(true);
      act(() => roundHook.current.play(0));
      expect(roundHook.current.previousAction).toBe(Action.PLAY);
      expect(roundHook.current.nextPlayers).toStrictEqual([true, false, false]);
      expect(roundHook.current.nextAction).toBe(Action.PLAY_OR_GO);
      expect(roundHook.current.previousCardPlayedBy).toBe(2);
      expect(roundHook.current.isCurrentPlayOver).toBe(false);

      // 0, 1, 2 must go
      expect(roundHook.current.isValidGo()).toBe(true);
      expect(roundHook.current.isValidPlay(0)).toBe(false);
      act(() => roundHook.current.go());
      expect(roundHook.current.previousAction).toBe(Action.GO);
      expect(roundHook.current.nextPlayers).toStrictEqual([false, true, false]);
      expect(roundHook.current.nextAction).toBe(Action.PLAY_OR_GO);
      expect(roundHook.current.previousCardPlayedBy).toBe(2);
      expect(roundHook.current.isCurrentPlayOver).toBe(false);

      expect(roundHook.current.isValidGo()).toBe(true);
      expect(roundHook.current.isValidPlay(0)).toBe(false);
      act(() => roundHook.current.go());
      expect(roundHook.current.previousAction).toBe(Action.GO);
      expect(roundHook.current.nextPlayers).toStrictEqual([false, false, true]);
      expect(roundHook.current.nextAction).toBe(Action.PLAY_OR_GO);
      expect(roundHook.current.previousCardPlayedBy).toBe(2);
      expect(roundHook.current.isCurrentPlayOver).toBe(false);

      expect(roundHook.current.isValidGo()).toBe(true);
      expect(roundHook.current.isValidPlay(0)).toBe(false);
      act(() => roundHook.current.go());
      expect(roundHook.current.previousAction).toBe(Action.GO);
      expect(roundHook.current.nextPlayers).toStrictEqual([true, false, false]);
      expect(roundHook.current.nextAction).toBe(Action.FLIP_PLAYED_CARDS);
      expect(roundHook.current.previousCardPlayedBy).toBe(2);
      expect(roundHook.current.isCurrentPlayOver).toBe(true);

      // 0 restarts
      act(() => roundHook.current.endPlay());
      expect(roundHook.current.previousAction).toBe(Action.FLIP_PLAYED_CARDS);
      expect(roundHook.current.nextPlayers).toStrictEqual([true, false, false]);
      expect(roundHook.current.nextAction).toBe(Action.PLAY_OR_GO);
      expect(roundHook.current.previousCardPlayedBy).toBe(null);
      expect(roundHook.current.isCurrentPlayOver).toBe(false);

      // ... etc., play remaining cards
      expect(roundHook.current.isValidPlay(0)).toBe(true);
      act(() => roundHook.current.play(0));

      expect(roundHook.current.isValidPlay(0)).toBe(true);
      act(() => roundHook.current.play(0));

      expect(roundHook.current.isValidPlay(0)).toBe(true);
      act(() => roundHook.current.play(0));
      expect(roundHook.current.previousAction).toBe(Action.PLAY);
      expect(roundHook.current.nextPlayers).toStrictEqual([true, false, false]);
      expect(roundHook.current.nextAction).toBe(Action.PLAY_OR_GO);
      expect(roundHook.current.previousCardPlayedBy).toBe(2);
      expect(roundHook.current.isCurrentPlayOver).toBe(false);

      expect(roundHook.current.isValidPlay(0)).toBe(true);
      act(() => roundHook.current.play(0));
      expect(roundHook.current.previousAction).toBe(Action.PLAY);
      expect(roundHook.current.nextPlayers).toStrictEqual([false, true, false]);
      expect(roundHook.current.nextAction).toBe(Action.RETURN_CARDS_TO_HANDS);
      expect(roundHook.current.previousCardPlayedBy).toBe(0);
      expect(roundHook.current.isCurrentPlayOver).toBe(true);
    });
  });

  // TODO: NEXT: continue from here

  // test("query scoring", () => {
  //   act(() => roundHook.current.deal());

  //   act(() => roundHook.current.discardToCrib(1, [4]));

  //   act(() => roundHook.current.discardToCrib(0, [3]));

  //   act(() => roundHook.current.discardToCrib(2, [2]));

  //   act(() => roundHook.current.cut());

  //   act(() => roundHook.current.flip());

  //   // 0 plays K: K -> 10
  //   act(() => roundHook.current.play(3));

  //   // 1 plays J: K, J -> 20
  //   act(() => roundHook.current.play(3));

  //   // 2 plays Q: K, J, Q -> 30
  //   act(() => roundHook.current.play(3));

  //   // 0 can't play
  //   act(() => roundHook.current.go());

  //   // 1 must play A -> 31
  //   act(() => roundHook.current.play(0));

  //   // start new 'sub-play' with 2
  //   act(() => roundHook.current.endPlay());

  //   // 2 plays J: J -> 10
  //   act(() => roundHook.current.play(2));

  //   // 0 plays 5 for 15: J, 5 -> 15
  //   act(() => roundHook.current.play(1));

  //   // 1 plays 10: J, 5, 10 -> 25
  //   act(() => roundHook.current.play(1));

  //   // 2 must play 5: J, 5, 10, 5 -> 30
  //   act(() => roundHook.current.play(0));

  //   // 0, 1, 2 must go
  //   act(() => roundHook.current.go());

  //   act(() => roundHook.current.go());

  //   act(() => roundHook.current.go());

  //   // play remaning cards
  //   act(() => roundHook.current.endPlay());

  //   act(() => roundHook.current.play(0));

  //   act(() => roundHook.current.play(0));

  //   act(() => roundHook.current.play(0));

  //   act(() => roundHook.current.play(0));

  //   expect(reducerHook.current[0].nextAction).toBe("endPlay-to-scoring");
  //   expect(reducerHook.current[0].nextPlayers).toStrictEqual([
  //     true,
  //     false,
  //     false,
  //   ]);

  //   act(() => roundHook.current.endPlay());

  //   expect(reducerHook.current[0].nextAction).toBe("score-hand");
  //   expect(reducerHook.current[0].nextPlayers).toStrictEqual([
  //     true,
  //     false,
  //     false,
  //   ]);

  //   // current hands/crib
  //   expect(roundHook.current.hands[0]).toStrictEqual([
  //     { rank: Rank.THREE, suit: Suit.HEART },
  //     { rank: Rank.FIVE, suit: Suit.CLUB },
  //     { rank: Rank.FIVE, suit: Suit.HEART },
  //     { rank: Rank.KING, suit: Suit.CLUB },
  //   ]);
  //   expect(roundHook.current.hands[1]).toStrictEqual([
  //     { rank: Rank.ACE, suit: Suit.DIAMOND },
  //     { rank: Rank.TWO, suit: Suit.HEART },
  //     { rank: Rank.TEN, suit: Suit.SPADE },
  //     { rank: Rank.JACK, suit: Suit.CLUB },
  //   ]);
  //   expect(roundHook.current.hands[2]).toStrictEqual([
  //     { rank: Rank.FIVE, suit: Suit.SPADE },
  //     { rank: Rank.NINE, suit: Suit.HEART },
  //     { rank: Rank.JACK, suit: Suit.HEART },
  //     { rank: Rank.QUEEN, suit: Suit.DIAMOND },
  //   ]);
  //   expect(roundHook.current.crib).toStrictEqual([
  //     { rank: Rank.FIVE, suit: Suit.DIAMOND },
  //     { rank: Rank.SIX, suit: Suit.SPADE },
  //     { rank: Rank.JACK, suit: Suit.DIAMOND },
  //     { rank: Rank.QUEEN, suit: Suit.HEART },
  //   ]);
  //   expect(roundHook.current.starter).toStrictEqual({
  //     rank: Rank.TEN,
  //     suit: Suit.DIAMOND,
  //   });

  //   // try scoring hand 2
  //   expect(roundHook.current.canScorePoints(2, [], "15")).toBe(false);
  //   expect(roundHook.current.canScorePoints(2, [3], "15")).toBe(false);
  //   expect(roundHook.current.canScorePoints(2, [6], "15")).toBe(false);
  //   expect(roundHook.current.canScorePoints(2, [0, 1], "15")).toBe(false);
  //   expect(roundHook.current.canScorePoints(2, [0, 2], "15")).toBe(true);
  //   expect(roundHook.current.canScorePoints(2, [0, 3], "15")).toBe(true);
  //   expect(roundHook.current.canScorePoints(2, [0, 6], "15")).toBe(true);
  //   expect(roundHook.current.canScorePoints(2, [1, 3], "15")).toBe(false);
  //   expect(roundHook.current.canScorePoints(2, [0, 2, 3], "15")).toBe(false);
  //   expect(roundHook.current.canScorePoints(2, [3, 4], "15")).toBe(false);
  //   expect(roundHook.current.canScorePoints(2, [], "run")).toBe(false);
  //   expect(roundHook.current.canScorePoints(2, [0, 1, 2, 3], "run")).toBe(false);
  //   expect(roundHook.current.canScorePoints(2, [0, 1, 2, 3, 6], "run")).toBe(
  //     false
  //   );
  //   expect(roundHook.current.canScorePoints(2, [2, 3], "run")).toBe(false);
  //   expect(roundHook.current.canScorePoints(2, [6, 1], "run")).toBe(false);
  //   expect(roundHook.current.canScorePoints(2, [6, 2, 3], "run")).toBe(true);
  //   expect(roundHook.current.canScorePoints(2, [1, 6, 2], "run")).toBe(true);
  //   expect(roundHook.current.canScorePoints(2, [2, 3, 6, 1], "run")).toBe(true);
  //   expect(roundHook.current.canScorePoints(2, [2, 3], "run")).toBe(false);
  //   expect(roundHook.current.canScorePoints(2, [], "kind")).toBe(false);
  //   expect(roundHook.current.canScorePoints(2, [0], "kind")).toBe(false);
  //   expect(roundHook.current.canScorePoints(2, [1, 2], "kind")).toBe(false);
  //   expect(roundHook.current.canScorePoints(2, [0, 6, 3], "kind")).toBe(false);
  //   expect(roundHook.current.canScorePoints(2, [2, 3], "kind")).toBe(false);
  //   expect(roundHook.current.canScorePoints(2, [], "flush")).toBe(false);
  //   expect(roundHook.current.canScorePoints(2, [0], "flush")).toBe(false);
  //   expect(roundHook.current.canScorePoints(2, [1, 2], "flush")).toBe(false);
  //   expect(roundHook.current.canScorePoints(2, [6, 3], "flush")).toBe(false);
  //   expect(roundHook.current.canScorePoints(2, [0, 3, 2, 1], "flush")).toBe(
  //     false
  //   );

  //   // try scoring crib
  //   expect(roundHook.current.canScorePoints(-1, [], "15")).toBe(false);
  //   expect(roundHook.current.canScorePoints(-1, [0, 1], "15")).toBe(false);
  //   expect(roundHook.current.canScorePoints(-1, [1, 2], "15")).toBe(false);
  //   expect(roundHook.current.canScorePoints(-1, [0, 2], "15")).toBe(true);
  //   expect(roundHook.current.canScorePoints(-1, [0, 3], "15")).toBe(true);
  //   expect(roundHook.current.canScorePoints(-1, [0, 6], "15")).toBe(true);
  //   expect(roundHook.current.canScorePoints(-1, [0, 1], "run")).toBe(false);
  //   expect(roundHook.current.canScorePoints(-1, [0, 1, 6], "run")).toBe(false);
  //   expect(roundHook.current.canScorePoints(-1, [6, 2, 3], "run")).toBe(true);
  //   expect(roundHook.current.canScorePoints(-1, [6, 3], "run")).toBe(false);
  //   expect(roundHook.current.canScorePoints(-1, [], "kind")).toBe(false);
  //   expect(roundHook.current.canScorePoints(-1, [0], "kind")).toBe(false);
  //   expect(roundHook.current.canScorePoints(-1, [6], "kind")).toBe(false);
  //   expect(roundHook.current.canScorePoints(-1, [2, 3], "kind")).toBe(false);
  //   expect(roundHook.current.canScorePoints(-1, [], "flush")).toBe(false);
  //   expect(roundHook.current.canScorePoints(-1, [0, 1, 2, 3], "flush")).toBe(
  //     false
  //   );
  //   expect(roundHook.current.canScorePoints(-1, [6, 0, 1, 2], "flush")).toBe(
  //     false
  //   );
  //   expect(roundHook.current.canScorePoints(-1, [0, 2, 6], "flush")).toBe(false);

  //   // a pair
  //   expect(roundHook.current.canScorePoints(0, [2, 1], "kind")).toBe(true);
  // });

  // test("score hands and crib, finish round", () => {
  //   act(() => roundHook.current.deal());
  //   act(() => roundHook.current.discardToCrib(1, [4]));
  //   act(() => roundHook.current.discardToCrib(0, [3]));
  //   act(() => roundHook.current.discardToCrib(2, [2]));
  //   act(() => roundHook.current.cut());
  //   act(() => roundHook.current.flip());
  //   // 0 plays K: K -> 10
  //   act(() => roundHook.current.play(3));
  //   // 1 plays J: K, J -> 20
  //   act(() => roundHook.current.play(3));
  //   // 2 plays Q: K, J, Q -> 30
  //   act(() => roundHook.current.play(3));
  //   // 0 can't play
  //   act(() => roundHook.current.go());
  //   // 1 must play A -> 31
  //   act(() => roundHook.current.play(0));
  //   // start new 'sub-play' with 2
  //   act(() => roundHook.current.endPlay());
  //   // 2 plays J: J -> 10
  //   act(() => roundHook.current.play(2));
  //   // 0 plays 5 for 15: J, 5 -> 15
  //   act(() => roundHook.current.play(1));
  //   // 1 plays 10: J, 5, 10 -> 25
  //   act(() => roundHook.current.play(1));
  //   // 2 must play 5: J, 5, 10, 5 -> 30
  //   act(() => roundHook.current.play(0));
  //   // 0, 1, 2 must go
  //   act(() => roundHook.current.go());
  //   act(() => roundHook.current.go());
  //   act(() => roundHook.current.go());
  //   // play remaning cards
  //   act(() => roundHook.current.endPlay());
  //   act(() => roundHook.current.play(0));
  //   act(() => roundHook.current.play(0));
  //   act(() => roundHook.current.play(0));
  //   act(() => roundHook.current.play(0));

  //   expect(reducerHook.current[0].nextAction).toBe("endPlay-to-scoring");
  //   expect(reducerHook.current[0].nextPlayers).toStrictEqual([
  //     true,
  //     false,
  //     false,
  //   ]);

  //   act(() => roundHook.current.endPlay());

  //   expect(reducerHook.current[0].nextAction).toBe("score-hand");
  //   expect(reducerHook.current[0].nextPlayers).toStrictEqual([
  //     true,
  //     false,
  //     false,
  //   ]);

  //   act(() => roundHook.current.scoreHand());

  //   expect(reducerHook.current[0].nextAction).toBe("score-hand");
  //   expect(reducerHook.current[0].nextPlayers).toStrictEqual([
  //     false,
  //     true,
  //     false,
  //   ]);

  //   act(() => roundHook.current.scoreHand());

  //   expect(reducerHook.current[0].nextAction).toBe("score-hand");
  //   expect(reducerHook.current[0].nextPlayers).toStrictEqual([
  //     false,
  //     false,
  //     true,
  //   ]);

  //   act(() => roundHook.current.scoreHand());

  //   expect(reducerHook.current[0].nextAction).toBe("score-crib");
  //   expect(reducerHook.current[0].nextPlayers).toStrictEqual([
  //     false,
  //     false,
  //     true,
  //   ]);

  //   act(() => roundHook.current.scoreCrib());

  //   expect(reducerHook.current[0].nextAction).toBe("reset");
  //   expect(reducerHook.current[0].nextPlayers).toStrictEqual([
  //     true,
  //     false,
  //     false,
  //   ]);
  // });

  // test("play round then reset", () => {
  //   act(() => roundHook.current.deal());
  //   act(() => roundHook.current.discardToCrib(1, [4]));
  //   act(() => roundHook.current.discardToCrib(0, [3]));
  //   act(() => roundHook.current.discardToCrib(2, [2]));
  //   act(() => roundHook.current.cut());
  //   act(() => roundHook.current.flip());
  //   // 0 plays K: K -> 10
  //   act(() => roundHook.current.play(3));
  //   // 1 plays J: K, J -> 20
  //   act(() => roundHook.current.play(3));
  //   // 2 plays Q: K, J, Q -> 30
  //   act(() => roundHook.current.play(3));
  //   // 0 can't play
  //   act(() => roundHook.current.go());
  //   // 1 must play A -> 31
  //   act(() => roundHook.current.play(0));
  //   // start new 'sub-play' with 2
  //   act(() => roundHook.current.endPlay());
  //   // 2 plays J: J -> 10
  //   act(() => roundHook.current.play(2));
  //   // 0 plays 5 for 15: J, 5 -> 15
  //   act(() => roundHook.current.play(1));
  //   // 1 plays 10: J, 5, 10 -> 25
  //   act(() => roundHook.current.play(1));
  //   // 2 must play 5: J, 5, 10, 5 -> 30
  //   act(() => roundHook.current.play(0));
  //   // 0, 1, 2 must go
  //   act(() => roundHook.current.go());
  //   act(() => roundHook.current.go());
  //   act(() => roundHook.current.go());
  //   // play remaning cards
  //   act(() => roundHook.current.endPlay());
  //   act(() => roundHook.current.play(0));
  //   act(() => roundHook.current.play(0));
  //   act(() => roundHook.current.play(0));
  //   act(() => roundHook.current.play(0));

  //   act(() => roundHook.current.endPlay());
  //   act(() => roundHook.current.scoreHand());
  //   act(() => roundHook.current.scoreHand());
  //   act(() => roundHook.current.scoreHand());
  //   act(() => roundHook.current.scoreCrib());

  //   expect(reducerHook.current[0].nextAction).toBe("reset");
  //   expect(reducerHook.current[0].nextPlayers).toStrictEqual([
  //     true,
  //     false,
  //     false,
  //   ]);

  //   // in practice, dealer param would have incremented, but not sure how to mock
  //   act(() => roundHook.current.reset());

  //   expect(roundHook.current.starter).toBeNull;
  //   expect(roundHook.current.crib).toStrictEqual([]);
  //   expect(roundHook.current.hands).toStrictEqual([[], [], []]);
  //   expect(roundHook.current.piles).toStrictEqual([[], [], []]);
  //   expect(reducerHook.current[0].nextPlayers).toStrictEqual([
  //     false,
  //     false,
  //     true,
  //   ]);
  //   expect(reducerHook.current[0].nextAction).toBe("deal");
  // });
});

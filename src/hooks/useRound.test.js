// import { render } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react-hooks";

import { useRound } from "./useRound.js";
import { useDeck } from "./useDeck.js";

import Rank from "./../playing-cards/Rank.js";
import Suit from "./../playing-cards/Suit.js";

//// Setup

const playerCount = 3;
const dealer = 2;
const cards = [
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

let result;
beforeEach(() => {
  const deckHook = renderHook(() => useDeck([...cards])).result;
  const testDeck = {
    size: deckHook.current.size,
    isEmpty: deckHook.current.isEmpty,
    draw: (i) => deckHook.current.draw(i),
    isCut: deckHook.current.isCut,
    cut: deckHook.current.cut,
    uncut: deckHook.current.uncut,
    reset: deckHook.current.reset,
  };
  result = renderHook(() => useRound(playerCount, dealer, testDeck)).result;
});

//// Tests

it("initial state", () => {
  expect(result.current.starter).toBeNull;
  expect(result.current.crib).toStrictEqual([]);
  expect(result.current.hands).toStrictEqual([[], [], []]);
  expect(result.current.piles).toStrictEqual([[], [], []]);
  expect(result.current.toPlay).toStrictEqual(new Set([dealer]));
  expect(result.current.stage).toBe("deal");
});

it("deal", () => {
  act(() => result.current.deal());

  expect(result.current.starter).toBeNull;

  expect(result.current.crib.length).toBe(1);
  expect(result.current.crib[0].rank.symbol).toBe("5");
  expect(result.current.crib[0].suit.name).toBe("Diamond");

  expect(result.current.hands.map((hand) => hand.length)).toStrictEqual([
    5, 5, 5,
  ]);
  expect(result.current.hands[0]).toStrictEqual([
    { rank: Rank.THREE, suit: Suit.HEART },
    { rank: Rank.FIVE, suit: Suit.CLUB },
    { rank: Rank.FIVE, suit: Suit.HEART },
    { rank: Rank.SIX, suit: Suit.SPADE },
    { rank: Rank.KING, suit: Suit.CLUB },
  ]);

  expect(result.current.piles).toStrictEqual([[], [], []]);
  expect(result.current.toPlay).toStrictEqual(new Set([0, 1, 2]));
  expect(result.current.stage).toBe("discard");
});

it("to crib", () => {
  act(() => result.current.deal());
  act(() => result.current.sendToCrib(2, [2]));

  expect(result.current.starter).toBeNull;
  expect(result.current.crib).toStrictEqual([
    { rank: Rank.FIVE, suit: Suit.DIAMOND },
    { rank: Rank.JACK, suit: Suit.DIAMOND },
  ]);
  expect(result.current.hands[0]).toStrictEqual([
    { rank: Rank.THREE, suit: Suit.HEART },
    { rank: Rank.FIVE, suit: Suit.CLUB },
    { rank: Rank.FIVE, suit: Suit.HEART },
    { rank: Rank.SIX, suit: Suit.SPADE },
    { rank: Rank.KING, suit: Suit.CLUB },
  ]);
  expect(result.current.hands[2]).toStrictEqual([
    { rank: Rank.FIVE, suit: Suit.SPADE },
    { rank: Rank.NINE, suit: Suit.HEART },
    { rank: Rank.JACK, suit: Suit.HEART },
    { rank: Rank.QUEEN, suit: Suit.DIAMOND },
  ]);
  expect(result.current.piles).toStrictEqual([[], [], []]);
  expect(result.current.toPlay).toStrictEqual(new Set([0, 1]));
  expect(result.current.stage).toBe("discard");

  act(() => result.current.sendToCrib(0, [3]));

  expect(result.current.starter).toBeNull;
  expect(result.current.crib).toStrictEqual([
    { rank: Rank.FIVE, suit: Suit.DIAMOND },
    { rank: Rank.SIX, suit: Suit.SPADE },
    { rank: Rank.JACK, suit: Suit.DIAMOND },
  ]);
  expect(result.current.hands[0]).toStrictEqual([
    { rank: Rank.THREE, suit: Suit.HEART },
    { rank: Rank.FIVE, suit: Suit.CLUB },
    { rank: Rank.FIVE, suit: Suit.HEART },
    { rank: Rank.KING, suit: Suit.CLUB },
  ]);
  expect(result.current.hands[2]).toStrictEqual([
    { rank: Rank.FIVE, suit: Suit.SPADE },
    { rank: Rank.NINE, suit: Suit.HEART },
    { rank: Rank.JACK, suit: Suit.HEART },
    { rank: Rank.QUEEN, suit: Suit.DIAMOND },
  ]);
  expect(result.current.piles).toStrictEqual([[], [], []]);
  expect(result.current.toPlay).toStrictEqual(new Set([1]));
  expect(result.current.stage).toBe("discard");

  act(() => result.current.sendToCrib(1, [4]));

  expect(result.current.starter).toBeNull;
  expect(result.current.crib).toStrictEqual([
    { rank: Rank.FIVE, suit: Suit.DIAMOND },
    { rank: Rank.SIX, suit: Suit.SPADE },
    { rank: Rank.JACK, suit: Suit.DIAMOND },
    { rank: Rank.QUEEN, suit: Suit.HEART },
  ]);
  expect(result.current.hands[0]).toStrictEqual([
    { rank: Rank.THREE, suit: Suit.HEART },
    { rank: Rank.FIVE, suit: Suit.CLUB },
    { rank: Rank.FIVE, suit: Suit.HEART },
    { rank: Rank.KING, suit: Suit.CLUB },
  ]);
  expect(result.current.hands[2]).toStrictEqual([
    { rank: Rank.FIVE, suit: Suit.SPADE },
    { rank: Rank.NINE, suit: Suit.HEART },
    { rank: Rank.JACK, suit: Suit.HEART },
    { rank: Rank.QUEEN, suit: Suit.DIAMOND },
  ]);
  expect(result.current.piles).toStrictEqual([[], [], []]);
  expect(result.current.toPlay).toStrictEqual(new Set([0]));
  expect(result.current.stage).toBe("cut");
});

it("cut and flip", () => {
  act(() => result.current.deal());
  act(() => result.current.sendToCrib(1, [1]));
  act(() => result.current.sendToCrib(2, [0]));
  act(() => result.current.sendToCrib(0, [3]));

  let hands = result.current.hands;
  let crib = result.current.crib;

  act(() => result.current.cut());

  expect(result.current.starter).toBeNull;
  expect(result.current.crib).toStrictEqual(crib);
  expect(result.current.hands).toStrictEqual(hands);
  expect(result.current.piles).toStrictEqual([[], [], []]);
  expect(result.current.toPlay).toStrictEqual(new Set([2]));
  expect(result.current.stage).toBe("flip");

  act(() => result.current.flip());

  expect(result.current.starter).toStrictEqual({
    rank: Rank.TEN,
    suit: Suit.DIAMOND,
  });
  expect(result.current.crib).toStrictEqual(crib);
  expect(result.current.hands).toStrictEqual(hands);
  expect(result.current.piles).toStrictEqual([[], [], []]);
  expect(result.current.toPlay).toStrictEqual(new Set([0]));
  expect(result.current.stage).toBe("play");
});

it("valid opening play", () => {
  act(() => result.current.deal());
  act(() => result.current.sendToCrib(1, [2]));
  act(() => result.current.sendToCrib(2, [4]));
  act(() => result.current.sendToCrib(0, [4]));
  act(() => result.current.cut());
  act(() => result.current.flip());

  // to play is 0, from above test
  expect(result.current.hands[0]).toStrictEqual([
    { rank: Rank.THREE, suit: Suit.HEART },
    { rank: Rank.FIVE, suit: Suit.CLUB },
    { rank: Rank.FIVE, suit: Suit.HEART },
    { rank: Rank.SIX, suit: Suit.SPADE },
  ]);

  expect(result.current.isValidPlay(0)).toBe(true);
  expect(result.current.isValidPlay(1)).toBe(true);
  expect(result.current.isValidPlay(2)).toBe(true);
  expect(result.current.isValidPlay(3)).toBe(true);
  expect(result.current.isValidPlay(0, "15")).toBe(false);
  expect(result.current.isValidPlay(1, "15")).toBe(false);
  expect(result.current.isValidPlay(2, "15")).toBe(false);
  expect(result.current.isValidPlay(3, "15")).toBe(false);
  expect(result.current.isValidPlay(0, "run")).toBe(false);
  expect(result.current.isValidPlay(1, "run")).toBe(false);
  expect(result.current.isValidPlay(2, "run")).toBe(false);
  expect(result.current.isValidPlay(3, "run")).toBe(false);
  expect(result.current.isValidPlay(0, "kind")).toBe(false);
  expect(result.current.isValidPlay(1, "kind")).toBe(false);
  expect(result.current.isValidPlay(2, "kind")).toBe(false);
  expect(result.current.isValidPlay(3, "kind")).toBe(false);

  expect(result.current.isValidGo()).toBe(false);
});

it("opening plays", () => {
  act(() => result.current.deal());
  act(() => result.current.sendToCrib(1, [2]));
  act(() => result.current.sendToCrib(2, [4]));
  act(() => result.current.sendToCrib(0, [4]));
  act(() => result.current.cut());
  act(() => result.current.flip());

  let hand2 = result.current.hands[2];
  let pile2 = result.current.piles[2];

  // to play is 0, from above test
  expect(result.current.hands[0]).toStrictEqual([
    { rank: Rank.THREE, suit: Suit.HEART },
    { rank: Rank.FIVE, suit: Suit.CLUB },
    { rank: Rank.FIVE, suit: Suit.HEART },
    { rank: Rank.SIX, suit: Suit.SPADE },
  ]);

  act(() => result.current.play(2)); // 5H

  expect(result.current.hands[0]).toStrictEqual([
    { rank: Rank.THREE, suit: Suit.HEART },
    { rank: Rank.FIVE, suit: Suit.CLUB },
    { rank: Rank.SIX, suit: Suit.SPADE },
  ]);
  expect(result.current.hands[2]).toStrictEqual(hand2);
  expect(result.current.piles[0]).toStrictEqual([
    { rank: Rank.FIVE, suit: Suit.HEART },
  ]);
  expect(result.current.piles[2]).toStrictEqual(pile2);
  expect(result.current.starter).toStrictEqual({
    rank: Rank.TEN,
    suit: Suit.DIAMOND,
  });
  expect(result.current.toPlay).toStrictEqual(new Set([1]));
  expect(result.current.stage).toBe("play");
});

it("follow-up plays", () => {
  act(() => result.current.deal());
  act(() => result.current.sendToCrib(1, [2]));
  act(() => result.current.sendToCrib(2, [4]));
  act(() => result.current.sendToCrib(0, [4]));
  act(() => result.current.cut());
  act(() => result.current.flip());

  act(() => result.current.play(2)); // 5H

  expect(result.current.isValidPlay(0)).toBe(true); // A
  expect(result.current.isValidPlay(1)).toBe(true); // 2
  expect(result.current.isValidPlay(2)).toBe(true); // J
  expect(result.current.isValidPlay(3)).toBe(true); // Q
  expect(result.current.isValidPlay(0, "15")).toBe(false);
  expect(result.current.isValidPlay(1, "15")).toBe(false);
  expect(result.current.isValidPlay(2, "15")).toBe(true);
  expect(result.current.isValidPlay(3, "15")).toBe(true);
  expect(result.current.isValidPlay(0, "run")).toBe(false);
  expect(result.current.isValidPlay(1, "run")).toBe(false);
  expect(result.current.isValidPlay(2, "run")).toBe(false);
  expect(result.current.isValidPlay(3, "run")).toBe(false);
  expect(result.current.isValidPlay(0, "kind")).toBe(false);
  expect(result.current.isValidPlay(1, "kind")).toBe(false);
  expect(result.current.isValidPlay(2, "kind")).toBe(false);
  expect(result.current.isValidPlay(3, "kind")).toBe(false);

  expect(result.current.isValidGo()).toBe(false);

  act(() => result.current.play(2)); // J

  expect(result.current.isValidPlay(0)).toBe(true); // 5
  expect(result.current.isValidPlay(1)).toBe(true); // 9
  expect(result.current.isValidPlay(2)).toBe(true); // J
  expect(result.current.isValidPlay(3)).toBe(true); // J
  expect(result.current.isValidPlay(0, "15")).toBe(false);
  expect(result.current.isValidPlay(1, "15")).toBe(false);
  expect(result.current.isValidPlay(2, "15")).toBe(false);
  expect(result.current.isValidPlay(3, "15")).toBe(false);
  expect(result.current.isValidPlay(0, "run")).toBe(false);
  expect(result.current.isValidPlay(1, "run")).toBe(false);
  expect(result.current.isValidPlay(2, "run")).toBe(false);
  expect(result.current.isValidPlay(3, "run")).toBe(false);
  expect(result.current.isValidPlay(0, "kind", 2)).toBe(false);
  expect(result.current.isValidPlay(1, "kind", 2)).toBe(false);
  expect(result.current.isValidPlay(2, "kind", 2)).toBe(true);
  expect(result.current.isValidPlay(3, "kind", 2)).toBe(true);

  expect(result.current.isValidGo()).toBe(false);
});

it("full play stage", () => {
  act(() => result.current.deal());
  act(() => result.current.sendToCrib(1, [4]));
  act(() => result.current.sendToCrib(0, [3]));
  act(() => result.current.sendToCrib(2, [2]));
  act(() => result.current.cut());
  act(() => result.current.flip());

  expect(result.current.hands[0]).toStrictEqual([
    { rank: Rank.THREE, suit: Suit.HEART },
    { rank: Rank.FIVE, suit: Suit.CLUB },
    { rank: Rank.FIVE, suit: Suit.HEART },
    { rank: Rank.KING, suit: Suit.CLUB },
  ]);
  expect(result.current.hands[1]).toStrictEqual([
    { rank: Rank.ACE, suit: Suit.DIAMOND },
    { rank: Rank.TWO, suit: Suit.HEART },
    { rank: Rank.TEN, suit: Suit.SPADE },
    { rank: Rank.JACK, suit: Suit.CLUB },
  ]);
  expect(result.current.hands[2]).toStrictEqual([
    { rank: Rank.FIVE, suit: Suit.SPADE },
    { rank: Rank.NINE, suit: Suit.HEART },
    { rank: Rank.JACK, suit: Suit.HEART },
    { rank: Rank.QUEEN, suit: Suit.DIAMOND },
  ]);
  expect(result.current.toPlay).toStrictEqual(new Set([0]));

  // 0 plays K: K -> 10
  expect(result.current.isValidGo()).toBe(false);
  expect(result.current.isValidPlay(3)).toBe(true);
  expect(result.current.isValidPlay(3, "run", 2)).toBe(false);
  expect(result.current.isValidPlay(3, "kind", 2)).toBe(false);
  expect(result.current.isValidPlay(3, "15")).toBe(false);
  act(() => result.current.play(3));

  // 1 plays J: K, J -> 20
  expect(result.current.isValidGo()).toBe(false);
  expect(result.current.isValidPlay(3)).toBe(true);
  expect(result.current.isValidPlay(3, "run", 2)).toBe(false);
  expect(result.current.isValidPlay(3, "kind", 2)).toBe(false);
  expect(result.current.isValidPlay(3, "15")).toBe(false);
  act(() => result.current.play(3));

  // 2 plays Q: K, J, Q -> 30
  expect(result.current.isValidGo()).toBe(false);
  expect(result.current.isValidPlay(3)).toBe(true);
  expect(result.current.isValidPlay(3, "run", 2)).toBe(false);
  expect(result.current.isValidPlay(3, "run", 3)).toBe(true); // out-of-order run
  expect(result.current.isValidPlay(3, "kind", 2)).toBe(false);
  expect(result.current.isValidPlay(3, "kind", 3)).toBe(false);
  expect(result.current.isValidPlay(3, "15")).toBe(false);
  act(() => result.current.play(3));

  // 0 can't play
  expect(result.current.isValidPlay(0)).toBe(false);
  expect(result.current.isValidPlay(1)).toBe(false);
  expect(result.current.isValidPlay(2)).toBe(false);
  expect(result.current.isValidGo()).toBe(true);
  act(() => result.current.go());

  // 1 must play A -> 31
  expect(result.current.isValidPlay(0)).toBe(true);
  expect(result.current.isValidPlay(1)).toBe(false);
  expect(result.current.isValidPlay(2)).toBe(false);
  expect(result.current.isValidGo()).toBe(false);
  act(() => result.current.play(0));

  // start new 'sub-play' with 2
  expect(result.current.toPlay).toStrictEqual(new Set([2]));
  // 2 plays J: J -> 10
  expect(result.current.isValidGo()).toBe(false);
  expect(result.current.isValidPlay(2)).toBe(true);
  expect(result.current.isValidPlay(2, "run", 2)).toBe(false);
  expect(result.current.isValidPlay(2, "kind", 2)).toBe(false);
  expect(result.current.isValidPlay(2, "15")).toBe(false);
  act(() => result.current.play(2));

  // 0 plays 5 for 15: J, 5 -> 15
  expect(result.current.isValidGo()).toBe(false);
  expect(result.current.isValidPlay(1)).toBe(true);
  expect(result.current.isValidPlay(1, "run", 2)).toBe(false);
  expect(result.current.isValidPlay(1, "kind", 2)).toBe(false);
  expect(result.current.isValidPlay(1, "15")).toBe(true);
  act(() => result.current.play(1));

  // 1 plays 10: J, 5, 10 -> 25
  expect(result.current.isValidGo()).toBe(false);
  expect(result.current.isValidPlay(1)).toBe(true);
  expect(result.current.isValidPlay(1, "run", 2)).toBe(false);
  expect(result.current.isValidPlay(1, "kind", 2)).toBe(false);
  expect(result.current.isValidPlay(1, "15")).toBe(false);
  act(() => result.current.play(1));

  // 2 must play 5: J, 5, 10, 5 -> 30
  expect(result.current.isValidGo()).toBe(false);
  expect(result.current.isValidPlay(1)).toBe(false);
  expect(result.current.isValidPlay(0)).toBe(true);
  expect(result.current.isValidPlay(0, "run", 2)).toBe(false);
  expect(result.current.isValidPlay(0, "kind", 2)).toBe(false);
  expect(result.current.isValidPlay(0, "15")).toBe(false);
  expect(result.current.isValidPlay(0, "15", 2)).toBe(false);
  act(() => result.current.play(0));

  // 0, 1, 2 must go
  expect(result.current.isValidGo()).toBe(true);
  expect(result.current.isValidPlay(0)).toBe(false);
  act(() => result.current.go());
  expect(result.current.isValidGo()).toBe(true);
  expect(result.current.isValidPlay(0)).toBe(false);
  act(() => result.current.go());
  expect(result.current.isValidGo()).toBe(true);
  expect(result.current.isValidPlay(0)).toBe(false);
  act(() => result.current.go());

  // remaining
  expect(result.current.hands[0]).toStrictEqual([
    { rank: Rank.THREE, suit: Suit.HEART },
    { rank: Rank.FIVE, suit: Suit.HEART },
  ]);
  expect(result.current.hands[1]).toStrictEqual([
    { rank: Rank.TWO, suit: Suit.HEART },
  ]);
  expect(result.current.hands[2]).toStrictEqual([
    { rank: Rank.NINE, suit: Suit.HEART },
  ]);
  expect(result.current.piles.map((pile) => pile.length)).toStrictEqual([
    2, 3, 3,
  ]);

  // play remaning cards
  expect(result.current.isValidPlay(0)).toBe(true);
  act(() => result.current.play(0));
  expect(result.current.isValidPlay(0)).toBe(true);
  act(() => result.current.play(0));
  expect(result.current.isValidPlay(0)).toBe(true);
  act(() => result.current.play(0));
  expect(result.current.stage).toBe("play");
  expect(result.current.isValidPlay(0)).toBe(true);
  act(() => result.current.play(0));

  expect(result.current.stage).toBe("post-play");
  expect(result.current.toPlay).toStrictEqual(new Set([0]));
});

// TODO: NEXT: continue testing round: scoring hands/crib

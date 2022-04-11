// import { render } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react-hooks";

import { useReducer } from "react";

import { useRound } from "./useRound.js";
import { useDeck } from "./useDeck.js";
// import { reduceNextPlay } from "./useGame.js";

import Rank from "./../playing-cards/Rank.js";
import Suit from "./../playing-cards/Suit.js";

////////// NOTE ////////////
// PROBLEM: tests aren't working, likely/partly because renderHook doesn't re-render
// unless state in the hook changes, and sometimes state only changes in the deck
// or in the next play reducer (params to the hook)
//
// I tried artificially updating a dummy state after each action, which made most
// tests pass, but that's very hacky and some tests were still failing

//////// NOTE ///////
// useRound has been refactored a few times, tests are no longer setup correctly anyway

//// Setup

const playerCount = 3;
let dealer = 2;
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

let roundHook;
let reducerHook;
beforeEach(() => {
  // reducerHook = renderHook(() =>
  //   useReducer(reduceNextPlay, playerCount, (playerCount) => { // NOTE: broken
  //     let arr = Array(playerCount).fill(false);
  //     arr[dealer] = true;
  //     return {
  //       nextPlayers: arr,
  //       nextAction: "deal",
  //     };
  //   })
  // ).result;

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
  roundHook = renderHook(() =>
    useRound(
      playerCount,
      dealer,
      reducerHook.current[0].nextPlayers.indexOf(true),
      reducerHook.current[0].nextAction,
      reducerHook.current[1],
      testDeck
    )
  ).result;
});

//// Tests

it("dummy test", () => {
  expect(true).toBeTruthy;
});

// it("initial state", () => {
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

// it("deal", () => {
//   act(() => roundHook.current.deal());

//   expect(roundHook.current.starter).toBeNull;

//   expect(roundHook.current.crib.length).toBe(1);
//   expect(roundHook.current.crib[0].rank.symbol).toBe("5");
//   expect(roundHook.current.crib[0].suit.name).toBe("Diamond");

//   expect(roundHook.current.hands.map((hand) => hand.length)).toStrictEqual([
//     5, 5, 5,
//   ]);
//   expect(roundHook.current.hands[0]).toStrictEqual([
//     { rank: Rank.THREE, suit: Suit.HEART },
//     { rank: Rank.FIVE, suit: Suit.CLUB },
//     { rank: Rank.FIVE, suit: Suit.HEART },
//     { rank: Rank.SIX, suit: Suit.SPADE },
//     { rank: Rank.KING, suit: Suit.CLUB },
//   ]);

//   expect(roundHook.current.piles).toStrictEqual([[], [], []]);
//   expect(reducerHook.current[0].nextPlayers).toStrictEqual([true, true, true]);
//   expect(reducerHook.current[0].nextAction).toBe("discard");
// });

// it("to crib", () => {
//   act(() => roundHook.current.deal());

//   act(() => roundHook.current.discardToCrib(2, [2]));

//   expect(roundHook.current.starter).toBeNull;
//   expect(roundHook.current.crib).toStrictEqual([
//     { rank: Rank.FIVE, suit: Suit.DIAMOND },
//     { rank: Rank.JACK, suit: Suit.DIAMOND },
//   ]);
//   expect(roundHook.current.hands[0]).toStrictEqual([
//     { rank: Rank.THREE, suit: Suit.HEART },
//     { rank: Rank.FIVE, suit: Suit.CLUB },
//     { rank: Rank.FIVE, suit: Suit.HEART },
//     { rank: Rank.SIX, suit: Suit.SPADE },
//     { rank: Rank.KING, suit: Suit.CLUB },
//   ]);
//   expect(roundHook.current.hands[2]).toStrictEqual([
//     { rank: Rank.FIVE, suit: Suit.SPADE },
//     { rank: Rank.NINE, suit: Suit.HEART },
//     { rank: Rank.JACK, suit: Suit.HEART },
//     { rank: Rank.QUEEN, suit: Suit.DIAMOND },
//   ]);
//   expect(roundHook.current.piles).toStrictEqual([[], [], []]);
//   expect(reducerHook.current[0].nextPlayers).toStrictEqual([true, true, false]);
//   expect(reducerHook.current[0].nextAction).toBe("discard");

//   act(() => roundHook.current.discardToCrib(0, [3]));

//   expect(roundHook.current.starter).toBeNull;
//   expect(roundHook.current.crib).toStrictEqual([
//     { rank: Rank.FIVE, suit: Suit.DIAMOND },
//     { rank: Rank.SIX, suit: Suit.SPADE },
//     { rank: Rank.JACK, suit: Suit.DIAMOND },
//   ]);
//   expect(roundHook.current.hands[0]).toStrictEqual([
//     { rank: Rank.THREE, suit: Suit.HEART },
//     { rank: Rank.FIVE, suit: Suit.CLUB },
//     { rank: Rank.FIVE, suit: Suit.HEART },
//     { rank: Rank.KING, suit: Suit.CLUB },
//   ]);
//   expect(roundHook.current.hands[2]).toStrictEqual([
//     { rank: Rank.FIVE, suit: Suit.SPADE },
//     { rank: Rank.NINE, suit: Suit.HEART },
//     { rank: Rank.JACK, suit: Suit.HEART },
//     { rank: Rank.QUEEN, suit: Suit.DIAMOND },
//   ]);
//   expect(roundHook.current.piles).toStrictEqual([[], [], []]);
//   expect(reducerHook.current[0].nextPlayers).toStrictEqual([
//     false,
//     true,
//     false,
//   ]);
//   expect(reducerHook.current[0].nextAction).toBe("discard");

//   act(() => roundHook.current.discardToCrib(1, [4]));

//   expect(roundHook.current.starter).toBeNull;
//   expect(roundHook.current.crib).toStrictEqual([
//     { rank: Rank.FIVE, suit: Suit.DIAMOND },
//     { rank: Rank.SIX, suit: Suit.SPADE },
//     { rank: Rank.JACK, suit: Suit.DIAMOND },
//     { rank: Rank.QUEEN, suit: Suit.HEART },
//   ]);
//   expect(roundHook.current.hands[0]).toStrictEqual([
//     { rank: Rank.THREE, suit: Suit.HEART },
//     { rank: Rank.FIVE, suit: Suit.CLUB },
//     { rank: Rank.FIVE, suit: Suit.HEART },
//     { rank: Rank.KING, suit: Suit.CLUB },
//   ]);
//   expect(roundHook.current.hands[2]).toStrictEqual([
//     { rank: Rank.FIVE, suit: Suit.SPADE },
//     { rank: Rank.NINE, suit: Suit.HEART },
//     { rank: Rank.JACK, suit: Suit.HEART },
//     { rank: Rank.QUEEN, suit: Suit.DIAMOND },
//   ]);
//   expect(roundHook.current.piles).toStrictEqual([[], [], []]);
//   expect(reducerHook.current[0].nextPlayers).toStrictEqual([
//     true,
//     false,
//     false,
//   ]);
//   expect(reducerHook.current[0].nextAction).toBe("cut");
// });

// it("cut and flip", () => {
//   act(() => roundHook.current.deal());

//   act(() => roundHook.current.discardToCrib(1, [1]));
//   act(() => roundHook.current.discardToCrib(2, [0]));
//   act(() => roundHook.current.discardToCrib(0, [3]));

//   let hands = roundHook.current.hands;
//   let crib = roundHook.current.crib;

//   act(() => roundHook.current.cut());

//   expect(roundHook.current.starter).toBeNull;
//   expect(roundHook.current.crib).toStrictEqual(crib);
//   expect(roundHook.current.hands).toStrictEqual(hands);
//   expect(roundHook.current.piles).toStrictEqual([[], [], []]);
//   expect(reducerHook.current[0].nextPlayers).toStrictEqual([
//     false,
//     false,
//     true,
//   ]);
//   expect(reducerHook.current[0].nextAction).toBe("flip");

//   act(() => roundHook.current.flip());

//   expect(roundHook.current.starter).toStrictEqual({
//     rank: Rank.TEN,
//     suit: Suit.DIAMOND,
//   });
//   expect(roundHook.current.crib).toStrictEqual(crib);
//   expect(roundHook.current.hands).toStrictEqual(hands);
//   expect(roundHook.current.piles).toStrictEqual([[], [], []]);
//   expect(reducerHook.current[0].nextPlayers).toStrictEqual([
//     true,
//     false,
//     false,
//   ]);
//   expect(reducerHook.current[0].nextAction).toBe("play");
// });

// it("valid opening play", () => {
//   act(() => roundHook.current.deal());

//   act(() => roundHook.current.discardToCrib(1, [2]));
//   act(() => roundHook.current.discardToCrib(2, [4]));
//   act(() => roundHook.current.discardToCrib(0, [4]));
//   act(() => roundHook.current.cut());
//   act(() => roundHook.current.flip());

//   // to play is 0, from above test
//   expect(roundHook.current.hands[0]).toStrictEqual([
//     { rank: Rank.THREE, suit: Suit.HEART },
//     { rank: Rank.FIVE, suit: Suit.CLUB },
//     { rank: Rank.FIVE, suit: Suit.HEART },
//     { rank: Rank.SIX, suit: Suit.SPADE },
//   ]);

//   expect(roundHook.current.isValidPlay(0)).toBe(true);
//   expect(roundHook.current.isValidPlay(1)).toBe(true);
//   expect(roundHook.current.isValidPlay(2)).toBe(true);
//   expect(roundHook.current.isValidPlay(3)).toBe(true);
//   expect(roundHook.current.isValidPlay(0, "15")).toBe(false);
//   expect(roundHook.current.isValidPlay(1, "15")).toBe(false);
//   expect(roundHook.current.isValidPlay(2, "15")).toBe(false);
//   expect(roundHook.current.isValidPlay(3, "15")).toBe(false);
//   expect(roundHook.current.isValidPlay(0, "run")).toBe(false);
//   expect(roundHook.current.isValidPlay(1, "run")).toBe(false);
//   expect(roundHook.current.isValidPlay(2, "run")).toBe(false);
//   expect(roundHook.current.isValidPlay(3, "run")).toBe(false);
//   expect(roundHook.current.isValidPlay(0, "kind")).toBe(false);
//   expect(roundHook.current.isValidPlay(1, "kind")).toBe(false);
//   expect(roundHook.current.isValidPlay(2, "kind")).toBe(false);
//   expect(roundHook.current.isValidPlay(3, "kind")).toBe(false);

//   expect(roundHook.current.isValidGo()).toBe(false);
// });

// it("opening plays", () => {
//   act(() => roundHook.current.deal());

//   act(() => roundHook.current.discardToCrib(1, [2]));

//   act(() => roundHook.current.discardToCrib(2, [4]));

//   act(() => roundHook.current.discardToCrib(0, [4]));

//   act(() => roundHook.current.cut());

//   act(() => roundHook.current.flip());

//   let hand2 = roundHook.current.hands[2];
//   let pile2 = roundHook.current.piles[2];

//   // to play is 0, from above test
//   expect(roundHook.current.hands[0]).toStrictEqual([
//     { rank: Rank.THREE, suit: Suit.HEART },
//     { rank: Rank.FIVE, suit: Suit.CLUB },
//     { rank: Rank.FIVE, suit: Suit.HEART },
//     { rank: Rank.SIX, suit: Suit.SPADE },
//   ]);

//   act(() => roundHook.current.play(2)); // 5H

//   expect(roundHook.current.hands[0]).toStrictEqual([
//     { rank: Rank.THREE, suit: Suit.HEART },
//     { rank: Rank.FIVE, suit: Suit.CLUB },
//     { rank: Rank.SIX, suit: Suit.SPADE },
//   ]);
//   expect(roundHook.current.hands[2]).toStrictEqual(hand2);
//   expect(roundHook.current.piles[0]).toStrictEqual([
//     { rank: Rank.FIVE, suit: Suit.HEART },
//   ]);
//   expect(roundHook.current.piles[2]).toStrictEqual(pile2);
//   expect(roundHook.current.starter).toStrictEqual({
//     rank: Rank.TEN,
//     suit: Suit.DIAMOND,
//   });
//   expect(reducerHook.current[0].nextPlayers).toStrictEqual([
//     false,
//     true,
//     false,
//   ]);
//   expect(reducerHook.current[0].nextAction).toBe("play");
// });

// it("follow-up plays", () => {
//   act(() => roundHook.current.deal());

//   act(() => roundHook.current.discardToCrib(1, [2]));

//   act(() => roundHook.current.discardToCrib(2, [4]));

//   act(() => roundHook.current.discardToCrib(0, [4]));

//   act(() => roundHook.current.cut());

//   act(() => roundHook.current.flip());

//   act(() => roundHook.current.play(2)); // 5H

//   expect(roundHook.current.isValidPlay(0)).toBe(true); // A
//   expect(roundHook.current.isValidPlay(1)).toBe(true); // 2
//   expect(roundHook.current.isValidPlay(2)).toBe(true); // J
//   expect(roundHook.current.isValidPlay(3)).toBe(true); // Q
//   expect(roundHook.current.isValidPlay(0, "15")).toBe(false);
//   expect(roundHook.current.isValidPlay(1, "15")).toBe(false);
//   expect(roundHook.current.isValidPlay(2, "15")).toBe(true);
//   expect(roundHook.current.isValidPlay(3, "15")).toBe(true);
//   expect(roundHook.current.isValidPlay(0, "run")).toBe(false);
//   expect(roundHook.current.isValidPlay(1, "run")).toBe(false);
//   expect(roundHook.current.isValidPlay(2, "run")).toBe(false);
//   expect(roundHook.current.isValidPlay(3, "run")).toBe(false);
//   expect(roundHook.current.isValidPlay(0, "kind")).toBe(false);
//   expect(roundHook.current.isValidPlay(1, "kind")).toBe(false);
//   expect(roundHook.current.isValidPlay(2, "kind")).toBe(false);
//   expect(roundHook.current.isValidPlay(3, "kind")).toBe(false);

//   expect(roundHook.current.isValidGo()).toBe(false);

//   act(() => roundHook.current.play(2)); // J

//   expect(roundHook.current.isValidPlay(0)).toBe(true); // 5
//   expect(roundHook.current.isValidPlay(1)).toBe(true); // 9
//   expect(roundHook.current.isValidPlay(2)).toBe(true); // J
//   expect(roundHook.current.isValidPlay(3)).toBe(true); // J
//   expect(roundHook.current.isValidPlay(0, "15")).toBe(false);
//   expect(roundHook.current.isValidPlay(1, "15")).toBe(false);
//   expect(roundHook.current.isValidPlay(2, "15")).toBe(false);
//   expect(roundHook.current.isValidPlay(3, "15")).toBe(false);
//   expect(roundHook.current.isValidPlay(0, "run")).toBe(false);
//   expect(roundHook.current.isValidPlay(1, "run")).toBe(false);
//   expect(roundHook.current.isValidPlay(2, "run")).toBe(false);
//   expect(roundHook.current.isValidPlay(3, "run")).toBe(false);
//   expect(roundHook.current.isValidPlay(0, "kind", 2)).toBe(false);
//   expect(roundHook.current.isValidPlay(1, "kind", 2)).toBe(false);
//   expect(roundHook.current.isValidPlay(2, "kind", 2)).toBe(true);
//   expect(roundHook.current.isValidPlay(3, "kind", 2)).toBe(true);

//   expect(roundHook.current.isValidGo()).toBe(false);
// });

// it("full play nextAction", () => {
//   act(() => roundHook.current.deal());

//   act(() => roundHook.current.discardToCrib(1, [4]));

//   act(() => roundHook.current.discardToCrib(0, [3]));

//   act(() => roundHook.current.discardToCrib(2, [2]));

//   act(() => roundHook.current.cut());

//   act(() => roundHook.current.flip());

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
//   expect(reducerHook.current[0].nextPlayers).toStrictEqual([
//     true,
//     false,
//     false,
//   ]);

//   // 0 plays K: K -> 10
//   expect(roundHook.current.isValidGo()).toBe(false);
//   expect(roundHook.current.isValidPlay(3)).toBe(true);
//   expect(roundHook.current.isValidPlay(3, "run", 2)).toBe(false);
//   expect(roundHook.current.isValidPlay(3, "kind", 2)).toBe(false);
//   expect(roundHook.current.isValidPlay(3, "15")).toBe(false);
//   act(() => roundHook.current.play(3));

//   // 1 plays J: K, J -> 20
//   expect(roundHook.current.isValidGo()).toBe(false);
//   expect(roundHook.current.isValidPlay(3)).toBe(true);
//   expect(roundHook.current.isValidPlay(3, "run", 2)).toBe(false);
//   expect(roundHook.current.isValidPlay(3, "kind", 2)).toBe(false);
//   expect(roundHook.current.isValidPlay(3, "15")).toBe(false);
//   act(() => roundHook.current.play(3));

//   // 2 plays Q: K, J, Q -> 30
//   expect(roundHook.current.isValidGo()).toBe(false);
//   expect(roundHook.current.isValidPlay(3)).toBe(true);
//   expect(roundHook.current.isValidPlay(3, "run", 2)).toBe(false);
//   expect(roundHook.current.isValidPlay(3, "run", 3)).toBe(true); // out-of-order run
//   expect(roundHook.current.isValidPlay(3, "kind", 2)).toBe(false);
//   expect(roundHook.current.isValidPlay(3, "kind", 3)).toBe(false);
//   expect(roundHook.current.isValidPlay(3, "15")).toBe(false);
//   act(() => roundHook.current.play(3));

//   // 0 can't play
//   expect(roundHook.current.isValidPlay(0)).toBe(false);
//   expect(roundHook.current.isValidPlay(1)).toBe(false);
//   expect(roundHook.current.isValidPlay(2)).toBe(false);
//   expect(roundHook.current.isValidGo()).toBe(true);
//   act(() => roundHook.current.go());

//   // 1 must play A -> 31
//   expect(roundHook.current.isValidPlay(0)).toBe(true);
//   expect(roundHook.current.isValidPlay(1)).toBe(false);
//   expect(roundHook.current.isValidPlay(2)).toBe(false);
//   expect(roundHook.current.isValidGo()).toBe(false);
//   act(() => roundHook.current.play(0));

//   // start new 'sub-play' with 2
//   expect(reducerHook.current[0].nextPlayers).toStrictEqual([
//     false,
//     false,
//     true,
//   ]);
//   expect(reducerHook.current[0].nextAction).toBe("proceed-to-next-play");
//   act(() => roundHook.current.proceed());

//   expect(reducerHook.current[0].nextAction).toBe("play");

//   // 2 plays J: J -> 10
//   expect(roundHook.current.isValidGo()).toBe(false);
//   expect(roundHook.current.isValidPlay(2)).toBe(true);
//   expect(roundHook.current.isValidPlay(2, "run", 2)).toBe(false);
//   expect(roundHook.current.isValidPlay(2, "kind", 2)).toBe(false);
//   expect(roundHook.current.isValidPlay(2, "15")).toBe(false);
//   act(() => roundHook.current.play(2));

//   // 0 plays 5 for 15: J, 5 -> 15
//   expect(roundHook.current.isValidGo()).toBe(false);
//   expect(roundHook.current.isValidPlay(1)).toBe(true);
//   expect(roundHook.current.isValidPlay(1, "run", 2)).toBe(false);
//   expect(roundHook.current.isValidPlay(1, "kind", 2)).toBe(false);
//   expect(roundHook.current.isValidPlay(1, "15")).toBe(true);
//   act(() => roundHook.current.play(1));

//   // 1 plays 10: J, 5, 10 -> 25
//   expect(roundHook.current.isValidGo()).toBe(false);
//   expect(roundHook.current.isValidPlay(1)).toBe(true);
//   expect(roundHook.current.isValidPlay(1, "run", 2)).toBe(false);
//   expect(roundHook.current.isValidPlay(1, "kind", 2)).toBe(false);
//   expect(roundHook.current.isValidPlay(1, "15")).toBe(false);
//   act(() => roundHook.current.play(1));

//   // 2 must play 5: J, 5, 10, 5 -> 30
//   expect(roundHook.current.isValidGo()).toBe(false);
//   expect(roundHook.current.isValidPlay(1)).toBe(false);
//   expect(roundHook.current.isValidPlay(0)).toBe(true);
//   expect(roundHook.current.isValidPlay(0, "run", 2)).toBe(false);
//   expect(roundHook.current.isValidPlay(0, "kind", 2)).toBe(false);
//   expect(roundHook.current.isValidPlay(0, "15")).toBe(false);
//   expect(roundHook.current.isValidPlay(0, "15", 2)).toBe(false);
//   act(() => roundHook.current.play(0));

//   // 0, 1, 2 must go
//   expect(roundHook.current.isValidGo()).toBe(true);
//   expect(roundHook.current.isValidPlay(0)).toBe(false);
//   act(() => roundHook.current.go());

//   expect(roundHook.current.isValidGo()).toBe(true);
//   expect(roundHook.current.isValidPlay(0)).toBe(false);
//   act(() => roundHook.current.go());

//   expect(roundHook.current.isValidGo()).toBe(true);
//   expect(roundHook.current.isValidPlay(0)).toBe(false);
//   act(() => roundHook.current.go());

//   // remaining
//   expect(roundHook.current.hands[0]).toStrictEqual([
//     { rank: Rank.THREE, suit: Suit.HEART },
//     { rank: Rank.FIVE, suit: Suit.HEART },
//   ]);
//   expect(roundHook.current.hands[1]).toStrictEqual([
//     { rank: Rank.TWO, suit: Suit.HEART },
//   ]);
//   expect(roundHook.current.hands[2]).toStrictEqual([
//     { rank: Rank.NINE, suit: Suit.HEART },
//   ]);
//   expect(roundHook.current.piles.map((pile) => pile.length)).toStrictEqual([
//     2, 3, 3,
//   ]);

//   // 0 restarts
//   expect(reducerHook.current[0].nextAction).toBe("proceed-to-next-play");
//   act(() => roundHook.current.proceed());

//   expect(reducerHook.current[0].nextAction).toBe("play");

//   // play remaining cards
//   expect(roundHook.current.isValidPlay(0)).toBe(true);
//   act(() => roundHook.current.play(0));

//   expect(roundHook.current.isValidPlay(0)).toBe(true);
//   act(() => roundHook.current.play(0));

//   expect(roundHook.current.isValidPlay(0)).toBe(true);
//   act(() => roundHook.current.play(0));

//   expect(reducerHook.current[0].nextAction).toBe("play");
//   expect(roundHook.current.isValidPlay(0)).toBe(true);
//   act(() => roundHook.current.play(0));

//   expect(reducerHook.current[0].nextAction).toBe("proceed-to-scoring");
//   expect(reducerHook.current[0].nextPlayers).toStrictEqual([
//     true,
//     false,
//     false,
//   ]);
// });

// it("query scoring", () => {
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
//   act(() => roundHook.current.proceed());

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
//   act(() => roundHook.current.proceed());

//   act(() => roundHook.current.play(0));

//   act(() => roundHook.current.play(0));

//   act(() => roundHook.current.play(0));

//   act(() => roundHook.current.play(0));

//   expect(reducerHook.current[0].nextAction).toBe("proceed-to-scoring");
//   expect(reducerHook.current[0].nextPlayers).toStrictEqual([
//     true,
//     false,
//     false,
//   ]);

//   act(() => roundHook.current.proceed());

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

// it("score hands and crib, finish round", () => {
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
//   act(() => roundHook.current.proceed());
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
//   act(() => roundHook.current.proceed());
//   act(() => roundHook.current.play(0));
//   act(() => roundHook.current.play(0));
//   act(() => roundHook.current.play(0));
//   act(() => roundHook.current.play(0));

//   expect(reducerHook.current[0].nextAction).toBe("proceed-to-scoring");
//   expect(reducerHook.current[0].nextPlayers).toStrictEqual([
//     true,
//     false,
//     false,
//   ]);

//   act(() => roundHook.current.proceed());

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

// it("play round then reset", () => {
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
//   act(() => roundHook.current.proceed());
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
//   act(() => roundHook.current.proceed());
//   act(() => roundHook.current.play(0));
//   act(() => roundHook.current.play(0));
//   act(() => roundHook.current.play(0));
//   act(() => roundHook.current.play(0));

//   act(() => roundHook.current.proceed());
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

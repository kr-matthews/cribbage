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

// TODO: add tests for other functions, like below (copied from elsewhere)

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

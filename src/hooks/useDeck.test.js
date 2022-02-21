// import { render } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react-hooks";

import { useDeck } from "./useDeck.js";

import Suit from "./../playing-cards/Suit.js";
import Rank from "./../playing-cards/Rank.js";

//// Constants

let pseudoShuffledCards = [];
for (let rank of [
  Rank.TWO,
  Rank.TEN,
  Rank.SIX,
  Rank.ACE,
  Rank.EIGHT,
  Rank.SEVEN,
  Rank.JACK,
  Rank.KING,
  Rank.THREE,
  Rank.QUEEN,
  Rank.NINE,
  Rank.FOUR,
  Rank.FIVE,
]) {
  for (let suit of [Suit.CLUB, Suit.DIAMOND, Suit.SPADE, Suit.HEART]) {
    pseudoShuffledCards.push({ rank, suit });
  }
}

//// Tests

it("unspecified initial state", () => {
  const deck = renderHook(() => useDeck()).result.current;

  expect(deck.isEmpty).toBe(false);
  expect(deck.size).toBe(52);
  expect(deck.isCut).toBe(false);
});

it("specified initial state", () => {
  const deck = renderHook(() => useDeck([...pseudoShuffledCards])).result
    .current;

  expect(deck.isEmpty).toBe(false);
  expect(deck.size).toBe(52);
  expect(deck.isCut).toBe(false);
});

it("draw (without replacement) from random", () => {
  const { result } = renderHook(() => useDeck());

  let card;
  act(() => {
    card = result.current.draw();
  });

  expect(card.suit).toHaveProperty("name");
  expect(card.rank).toHaveProperty("symbol");
  expect(result.current.size).toBe(51);
  expect(result.current.isCut).toBe(false);
});

it("draw (without replacement) from specific", () => {
  const { result } = renderHook(() => useDeck([...pseudoShuffledCards]));

  let card;
  act(() => {
    card = result.current.draw();
  });

  expect(card.suit).toBe(Suit.HEART);
  expect(card.rank).toBe(Rank.FIVE);
  expect(result.current.size).toBe(51);
  expect(result.current.isCut).toBe(false);
});

it("draw then reset deck, unspecified", () => {
  const { result } = renderHook(() => useDeck());

  for (let i = 0; i < 5; i++) {
    act(() => {
      result.current.draw();
    });
  }

  expect(result.current.size).toBe(47);
  expect(result.current.isEmpty).toBe(false);
  expect(result.current.isCut).toBe(false);

  act(() => result.current.reset());

  expect(result.current.size).toBe(52);
  expect(result.current.isEmpty).toBe(false);
  expect(result.current.isCut).toBe(false);
});

it("draw then reset deck, specified", () => {
  const { result } = renderHook(() => useDeck());

  for (let i = 0; i < 5; i++) {
    act(() => {
      result.current.draw();
    });
  }

  expect(result.current.size).toBe(47);
  expect(result.current.isEmpty).toBe(false);
  expect(result.current.isCut).toBe(false);

  act(() => result.current.reset([...pseudoShuffledCards]));

  expect(result.current.size).toBe(52);
  expect(result.current.isEmpty).toBe(false);
  expect(result.current.isCut).toBe(false);
});

it("empty then reset deck, unspecified", () => {
  const { result } = renderHook(() => useDeck());

  for (let i = 0; i < 51; i++) {
    act(() => {
      result.current.draw();
    });
  }

  expect(result.current.size).toBe(1);
  expect(result.current.isEmpty).toBe(false);
  expect(result.current.isCut).toBe(false);

  act(() => {
    result.current.draw();
  });

  expect(result.current.size).toBe(0);
  expect(result.current.isEmpty).toBe(true);
  expect(result.current.isCut).toBe(false);

  act(() => result.current.reset());

  expect(result.current.size).toBe(52);
  expect(result.current.isEmpty).toBe(false);
  expect(result.current.isCut).toBe(false);
});

it("empty then reset deck, unspecified", () => {
  const { result } = renderHook(() => useDeck([...pseudoShuffledCards]));

  for (let i = 0; i < 51; i++) {
    act(() => {
      result.current.draw();
    });
  }

  expect(result.current.size).toBe(1);
  expect(result.current.isEmpty).toBe(false);
  expect(result.current.isCut).toBe(false);

  let card;
  act(() => {
    card = result.current.draw();
  });

  expect(result.current.size).toBe(0);
  expect(result.current.isEmpty).toBe(true);
  expect(card.suit).toBe(Suit.CLUB);
  expect(card.rank).toBe(Rank.TWO);
  expect(result.current.isCut).toBe(false);

  act(() => result.current.reset());

  expect(result.current.size).toBe(52);
  expect(result.current.isEmpty).toBe(false);
  expect(result.current.isCut).toBe(false);
});

it("cut deck", () => {
  const { result } = renderHook(() => useDeck());

  expect(result.current.isCut).toBe(false);

  act(() => result.current.cut());

  expect(result.current.isCut).toBe(true);

  act(() => result.current.uncut());

  expect(result.current.isCut).toBe(false);
});

it("cut and draw", () => {
  const { result } = renderHook(() => useDeck([...pseudoShuffledCards]));

  expect(result.current.isCut).toBe(false);

  act(() => result.current.cut());

  expect(result.current.isCut).toBe(true);

  let card;
  act(() => {
    card = result.current.draw();
  });

  expect(result.current.isCut).toBe(true);
  expect(card.suit).toBe(Suit.HEART);
  expect(card.rank).toBe(Rank.FIVE);
  expect(result.current.size).toBe(51);

  act(() => result.current.uncut());

  expect(result.current.isCut).toBe(false);
  expect(result.current.size).toBe(51);
});

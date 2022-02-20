import { render } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react-hooks";

import { useDeck } from "./useDeck.js";

//// Tests

it("initial state", () => {
  const deck = renderHook(() => useDeck()).result.current;

  expect(deck.isEmpty).toBe(false);
  expect(deck.size).toBe(52);
});

it("draw with replacement", () => {
  const deck = renderHook(() => useDeck()).result.current;

  let card;
  act(() => {
    card = deck.drawWithReplacement();
  });

  expect(card).toHaveProperty("suit");
  expect(card).toHaveProperty("rank");
  expect(deck.size).toBe(52);
});

it("draw without replacement", () => {
  const { result } = renderHook(() => useDeck());

  let card;
  act(() => {
    card = result.current.drawWithoutReplacement();
  });

  expect(card).toHaveProperty("suit");
  expect(card).toHaveProperty("rank");
  expect(result.current.size).toBe(51);
});

it("draw then reset deck", () => {
  const { result } = renderHook(() => useDeck());

  act(() => {
    result.current.drawWithoutReplacement();
    result.current.drawWithReplacement();
    result.current.drawWithReplacement();
    result.current.drawWithoutReplacement();
    result.current.drawWithReplacement();
  });

  expect(result.current.size).toBe(50);
  expect(result.current.isEmpty).toBe(false);

  act(() => result.current.reset());

  expect(result.current.size).toBe(52);
  expect(result.current.isEmpty).toBe(false);
});

it("empty then reset deck", () => {
  const { result } = renderHook(() => useDeck());

  for (let i = 0; i < 51; i++) {
    act(() => {
      result.current.drawWithoutReplacement();
    });
  }

  expect(result.current.size).toBe(1);
  expect(result.current.isEmpty).toBe(false);

  act(() => {
    result.current.drawWithoutReplacement();
  });

  expect(result.current.size).toBe(0);
  expect(result.current.isEmpty).toBe(true);

  act(() => result.current.reset());

  expect(result.current.size).toBe(52);
  expect(result.current.isEmpty).toBe(false);
});

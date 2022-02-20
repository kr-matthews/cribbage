import { useReducer } from "react";

import Suit from "./../playing-cards/Suit.js";
import Rank from "./../playing-cards/Rank.js";

//// Constants

let allCards = [];
for (let rank in [
  Rank.ACE,
  Rank.TWO,
  Rank.THREE,
  Rank.FOUR,
  Rank.FIVE,
  Rank.SIX,
  Rank.SEVEN,
  Rank.EIGHT,
  Rank.NINE,
  Rank.TEN,
  Rank.JACK,
  Rank.QUEEN,
  Rank.KING,
]) {
  for (let suit in [Suit.CLUB, Suit.DIAMOND, Suit.SPADE, Suit.HEART]) {
    allCards.push({ rank, suit });
  }
}

//// Reducers

function cardReducer(state, action) {
  let newState = [...state];
  switch (action.type) {
    case "reset":
      newState = [...allCards];
      shuffle(newState);
      break;

    case "remove":
      newState = newState.filter(
        ({ rank, suit }) => rank !== action.rank || suit !== action.suit
      );
      break;

    default:
      console.error("deckReducer no match for action:", action);
      break;
  }
  return newState;
}

/**
 * Shuffle an array in place.
 *
 * @param {Array} arr
 */
function shuffle(arr) {
  for (let i = 1; i < arr.length; i++) {
    let j = Math.floor(Math.random() * (i + 1));
    // swap i and j
    let x = arr[i];
    arr[i] = arr[j];
    arr[j] = x;
  }
}

//// Hook

export function useDeck() {
  //// Constants and States

  // the deck
  const [cards, dispatchCards] = useReducer(
    cardReducer,
    [...allCards],
    (cards) => {
      shuffle(cards);
      return cards;
    }
  );
  const size = cards.length;
  const isEmpty = size < 1;

  //// Helpers

  function getRandomCard() {
    if (isEmpty) return null;
    return cards[Math.floor(Math.random() * size)];
  }

  //// Return Functions

  function reset() {
    dispatchCards({ type: "reset" });
  }

  // use to deal
  function drawWithoutReplacement() {
    if (isEmpty) return null;
    let { rank, suit } = getRandomCard();
    dispatchCards({ type: "remove", rank, suit });
    return { rank, suit };
  }

  function drawWithReplacement() {
    return getRandomCard();
  }

  //// Return

  return {
    size,
    isEmpty,
    reset,
    drawWithReplacement,
    drawWithoutReplacement,
  };
}

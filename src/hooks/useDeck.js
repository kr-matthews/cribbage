import { useReducer, useState } from "react";

import Suit from "./../playing-cards/Suit.js";
import Rank from "./../playing-cards/Rank.js";

/**
 * Note: To ensure coordination between users, it's important that
 * everything after initialization/reset is deterministic.
 * Only randomness is current on init or reset when no explicit deck
 * is provided, in which case shuffle a sorted deck.
 */

//// Constants

// TODO: export from file in /playing-cards

let allCards = [];
for (let rank of [
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
  for (let suit of [Suit.CLUB, Suit.DIAMOND, Suit.SPADE, Suit.HEART]) {
    allCards.push({ rank, suit, faceUp: true }); // TEMP: face up
  }
}

//// Reducers

function cardsReducer(cards, action) {
  let newCards = [...cards];
  switch (action.type) {
    case "reset":
      newCards = [...allCards];
      shuffle(newCards);
      break;

    case "custom":
      newCards = [...action.cards];
      break;

    case "remove":
      let size = newCards.length;
      let count = action.count;
      if (size >= action.count) newCards.splice(size - count, count);
      break;

    default:
      console.error("deckReducer no match for action:", action);
      break;
  }
  return newCards;
}

//// Helpers

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

export function useDeck(initialCards) {
  //// Constants and States

  // is the deck currently split into two 'halves'
  const [isCut, setIsCut] = useState(false);

  // the deck, stored in an array in shuffled order
  const [cards, dispatchCards] = useReducer(
    cardsReducer,
    [...allCards],
    (cards) => {
      if (initialCards) return initialCards;
      shuffle(cards);
      return cards;
    }
  );
  const size = cards.length;
  const isEmpty = size < 1;

  //// Helpers

  //

  //// Return Functions

  /**
   * Owners shuffle their own decks on reset.
   * Non-owners must receive the order of cards from owners on reset.
   *
   * @param {Array} cards - Omit if owner.
   */
  function reset(cards) {
    if (cards) {
      dispatchCards({ type: "custom", cards });
    } else {
      dispatchCards({ type: "reset" });
    }
    setIsCut(false);
  }

  // use to deal
  function draw(count) {
    if (size < count) return null;
    let drawn = cards.slice(size - count);
    dispatchCards({ type: "remove", count });
    return drawn;
  }

  function cut() {
    setIsCut(true);
  }

  function uncut() {
    setIsCut(false);
  }

  //// Return

  return {
    size,
    isEmpty,
    draw,
    isCut,
    cut,
    uncut,
    reset,
  };
}

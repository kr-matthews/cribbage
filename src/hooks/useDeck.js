import { useReducer, useState } from "react";

import { allCards, shuffle } from "../playing-cards/cardHelpers.js";

//// Reducers ////

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
      if (size >= count) newCards.splice(size - count, count);
      break;

    default:
      console.error("deckReducer no match for action:", action);
      break;
  }
  return newCards;
}

////// Hook //////

/**
 * Note: To ensure coordination between users, it's important that
 * everything after initialization/reset is deterministic.
 * Only randomness is current on init or reset when no explicit deck
 * is provided, in which case shuffle a sorted deck.
 * (Except cutCount, which is for visual purposes only.)
 */
export function useDeck(initialCards) {
  //// Constants and States ////

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

  // how many cards are cut off of the top
  const [cutCount, setCutCount] = useState(0);
  const unCutCount = size - cutCount;
  const isCut = cutCount > 0;

  //// Helpers ////

  //

  //// Return Functions ////

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
    setCutCount(0);
  }

  /**
   * Remove cards from the deck.
   *
   * @param {Int} count (Optional) Number of cards to draw.
   * @returns {Array<Object>} Cards which were drawn.
   */
  function draw(count = 1) {
    if (count < 0 || size < count) return null;
    let drawn = cards.slice(size - count);
    dispatchCards({ type: "remove", count });
    return drawn;
  }

  /**
   * Cut some cards from the top of the (remaining, if already cut) deck.
   *
   * @param {Int} buffer (Optional) Minimum number of cards to (try to) leave in both halves.
   */
  function cut(buffer) {
    // by default, leave at least 3 cards if possible
    buffer ||= Math.min(3, Math.floor(unCutCount / 2));
    let toCut = Math.floor(Math.random() * (unCutCount - 2 * buffer)) + buffer;
    setCutCount((cutCount) => cutCount + toCut);
  }

  /**
   * Replace all cards which were cut (besides those drawn during the cut)
   * back onto the deck.
   */
  function uncut() {
    setCutCount(0);
  }

  //// Return ////

  return {
    size,
    isEmpty,
    draw,
    isCut,
    cutCount,
    cut,
    uncut,
    reset,
  };
}

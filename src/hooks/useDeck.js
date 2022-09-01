import { useReducer, useState } from "react";

import _ from "lodash";

import { allCards, riggedDeck, shuffle } from "../playing-cards/cardHelpers.js";

//// Reducers ////

function cardsReducer(cards, action) {
  let useRiggedDeck = action.useRiggedDeck;

  let newCards = [...cards];

  switch (action.type) {
    case "reset":
      if (useRiggedDeck) return riggedDeck;
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
export function useDeck(initialCards, useRiggedDeck = false) {
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
  const [cutCounts, setCutCounts] = useState([]);
  const unCutCount = size - _.sum(cutCounts);
  const isCut = cutCounts.length > 0;

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
      dispatchCards({ type: "custom", cards, useRiggedDeck });
    } else {
      dispatchCards({ type: "reset", useRiggedDeck });
    }
    setCutCounts([]);
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
   * @param {Int} bottomBuffer (Optional) Minimum number of cards to (try to) leave on the bottom.
   * @param {Int} topBuffer (Optional) Minimum number of cards to (try to) leave on the top.
   */
  function cut(bottomBuffer, topBuffer) {
    if (size < 2) return;
    // if no top buffer given, default to bottom buffer
    // if no buffers given, defautl to leaving at least 3 cards if possible
    topBuffer ||= bottomBuffer || Math.min(3, Math.floor(unCutCount / 2));
    bottomBuffer ||= Math.min(3, Math.floor(unCutCount / 2));
    let toCut =
      Math.floor(Math.random() * (unCutCount - bottomBuffer - topBuffer)) +
      topBuffer;
    setCutCounts((cutCounts) => [...cutCounts, toCut]);
  }

  /**
   * Replace all cards which were cut (besides those drawn during the cut)
   * back onto the deck.
   */
  function uncut() {
    setCutCounts([]);
  }

  //// Return ////

  return {
    cards,
    size,
    isEmpty,
    draw,
    isCut,
    unCutCount,
    cutCounts,
    cut,
    uncut,
    reset,
  };
}

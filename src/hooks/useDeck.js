import { useReducer, useState } from "react";

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

function cardsReducer(cards, action) {
  let newCards = [...cards];
  switch (action.type) {
    case "reset":
      newCards = [...allCards];
      shuffle(newCards);
      break;

    case "remove":
      if (
        newCards.length > 0 &&
        newCards[newCards.length - 1].rank === action.rank &&
        newCards[newCards.length - 1].suit === action.suit
      ) {
        newCards.pop();
      }
      break;

    default:
      console.error("deckReducer no match for action:", action);
      break;
  }
  return newCards;
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

  // is the deck currently split into two 'halves'
  const [isCut, setIsCut] = useState(false);

  // the deck, stored in an array in shuffled order
  const [cards, dispatchCards] = useReducer(
    cardsReducer,
    [...allCards],
    (cards) => {
      shuffle(cards);
      return cards;
    }
  );
  const size = cards.length;
  const isEmpty = size < 1;

  //// Helpers

  //

  //// Return Functions

  function reset() {
    dispatchCards({ type: "reset" });
    setIsCut(false);
  }

  // use to deal
  function draw() {
    if (isEmpty) return null;
    let card = cards[size - 1];
    dispatchCards({ type: "remove", suit: card.suit, rank: card.rank });
    return card;
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

import Suit from "./../playing-cards/Suit.js";
import Rank from "./../playing-cards/Rank.js";

//// Constants ////

/**
 * An array with all 52 cards, in sorted order.
 */
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

//// Helpers ////

/**
 * Shuffle an array in place.
 *
 * @param {Array} arr The array to shuffle in place.
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

/**
 * For passing to [sort] to sort an array of cards.
 *
 * @param {Object} card1
 * @param {Object} card2
 * @returns {Int} The difference between the two cards.
 */
function cardSorter(card1, card2) {
  return (
    card1.rank.index - card2.rank.index || card1.suit.index - card2.suit.index
  );
}

/**
 * Count the sum of the ranks of the cards (face cards count as ten, Ace as one).
 *
 * @param {Array<Object} cards The cards to count.
 * @returns
 */
function totalPoints(cards) {
  return cards.reduce((partialSum, { rank }) => partialSum + rank.points, 0);
}

/**
 * Checks whether all the cards together form the claim.
 * Doesn't account for the context of where the cards came from, so it won't
 * decline 4 cards from the crib from being a flush, or 3 cards from being a
 * run when the longest run in the original hand has length 4, for example.
 *
 * @param {Array<Object>} unorderedCards The cards being used in the claim.
 * @param {String} claim The claim being made about the cards: "15", "run", "kind", or "flush".
 * @returns {Boolean} Whether the claim is valid.
 */
function checkClaim(unorderedCards, claim, anyEndSegment = false) {
  if (unorderedCards.length < 2) return false;

  switch (claim) {
    case "15":
      return totalPoints(unorderedCards) === 15;

    case "kind":
      let rankIndex = unorderedCards[0].rank.index;
      return (
        unorderedCards.length >= 2 &&
        unorderedCards.every((card) => card.rank.index === rankIndex)
      );

    case "run":
      return (
        unorderedCards.length >= 3 &&
        unorderedCards
          .map((card) => card.rank.index)
          .sort((a, b) => a - b)
          .every(
            (num, index, nums) => index === 0 || num === nums[index - 1] + 1
          )
      );

    case "flush":
      let suitIndex = unorderedCards[0].suit.index;
      return (
        unorderedCards.length >= 4 &&
        unorderedCards.every((card) => card.suit.index === suitIndex)
      );

    default:
      console.error("checkClaim couldn't match claim:", claim);
  }
  return false;
}

/** Find the longest such claim, for automatic scoring during play phase.
 *
 * @param {Array<Any>} orderedCards The sorted cards being used in the claim; will examine end-segments.
 * @param {String} claim The claim being made about the cards: "15", "run", "kind", or "flush".
 * @returns {Int} Maximum number of points that can be claimed
 */
function longestSuchClaim(orderedCards, claim) {
  // start with the longest end-segment; first found will be best
  for (let i = 0; i < orderedCards.length - 1; i++) {
    if (checkClaim(orderedCards.slice(i), claim, false)) {
      switch (claim) {
        case "15":
          return 2;

        case "kind":
          switch (orderedCards.length - i) {
            case 2:
              return 2;
            case 3:
              return 6;
            case 4:
              return 12;
            default:
              return 0;
          }

        case "run":
          return orderedCards.length - i;

        // not applicable to flushes
        default:
          return 0;
      }
    }
  }
  return 0;
}

export {
  allCards,
  shuffle,
  cardSorter,
  totalPoints,
  checkClaim,
  longestSuchClaim,
};

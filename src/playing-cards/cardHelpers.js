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
 * run when the longest run in the original hand has length four, for example.
 *
 * @param {Array<Object>} cards The cards being used in the claim.
 * @param {String} claim The claim being made about the cards.
 * @param {Boolean} anyEndSegment Whether to check any end segment of cards - for automatic scoring.
 * @returns {Int} The points this claim gets.
 */
function checkClaim(cards, claim, anyEndSegment = false) {
  let points = 0;

  // for automatic scoring, check any end segment of the cards, take the first that works
  if (anyEndSegment) {
    for (let i = 0; i < cards.length - 1; i++) {
      points = checkClaim(cards.slice(i), claim, false);
      if (points > 0) return points;
    }
    return 0;
  }

  // for manual claims, the cards to use have already been specified
  if (cards.length < 2) return false;
  switch (claim) {
    case "15":
      if (totalPoints(cards) === 15) points = 2;
      break;

    case "kind":
      let rankIndex = cards[0].rank.index;
      if (
        cards.length >= 2 &&
        cards.every((card) => card.rank.index === rankIndex)
      )
        points = cards.length;
      break;

    case "run":
      if (
        cards.length >= 3 &&
        cards
          .map((card) => card.rank.index)
          .sort((a, b) => a - b)
          .every(
            (num, index, nums) => index === 0 || num === nums[index - 1] + 1
          )
      )
        points = cards.length;
      break;

    case "flush":
      let suitIndex = cards[0].suit.index;
      if (
        cards.length >= 4 &&
        cards.every((card) => card.suit.index === suitIndex)
      )
        points = cards.length;
      break;

    default:
      console.error("checkClaim couldn't match claim:", claim);
  }
  return points;
}

export { allCards, shuffle, cardSorter, totalPoints, checkClaim };

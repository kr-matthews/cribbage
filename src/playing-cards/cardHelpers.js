import Suit from "./../playing-cards/Suit.js";
import Rank from "./../playing-cards/Rank.js";

import _ from "lodash";

//// Constants ////

const claimTypes = ["15", "kind", "run", "flush"];

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
    allCards.push({ rank, suit, faceUp: false });
  }
}

// these cards will appear on the top of the deck
const manuallyOrderedCards = [
  // used in cut for dealer, and for hands
  { rank: Rank.ACE, suit: Suit.CLUB },
  { rank: Rank.TWO, suit: Suit.CLUB },
  { rank: Rank.THREE, suit: Suit.CLUB },

  { rank: Rank.TEN, suit: Suit.DIAMOND },
  { rank: Rank.NINE, suit: Suit.SPADE },
  { rank: Rank.TEN, suit: Suit.CLUB },

  { rank: Rank.ACE, suit: Suit.DIAMOND },
  { rank: Rank.NINE, suit: Suit.DIAMOND },
  { rank: Rank.SEVEN, suit: Suit.HEART },

  { rank: Rank.ACE, suit: Suit.HEART },
  { rank: Rank.SIX, suit: Suit.DIAMOND },
  { rank: Rank.FOUR, suit: Suit.CLUB },

  { rank: Rank.FIVE, suit: Suit.HEART },
  { rank: Rank.KING, suit: Suit.CLUB },
  { rank: Rank.KING, suit: Suit.SPADE },
  // end of hands (for 3 players)
];

// pad the deck up to 52
for (let index = manuallyOrderedCards.length; index < 52; index++) {
  manuallyOrderedCards.push({ rank: Rank.ACE, suit: Suit.CLUB });
}

/**
 * The desired deck order.
 */
export const riggedDeck = manuallyOrderedCards.reverse();

//// General Helpers ////

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
 * @param {Array<Object>} cards The cards to count.
 * @returns
 */
function totalPoints(cards) {
  return cards.reduce((partialSum, { rank }) => partialSum + rank.points, 0);
}

/**
 * Flip a card to a specific orientation, or regardless of orientation.
 *
 * @param {Object} card The card to flip.
 * @param {Boolean} faceUp Specify which way to face the cards, or null to flip regardless.
 */
export function flipCard(card, faceUp) {
  card.faceUp = faceUp ?? !card.faceUp;
}

//// Scoring Functions ////

/** Find most possible points of this claim type to get from the stack.
 * Ex: with K, 5, 6, 3, 4, 2, 5 and claim of "run", would find 5 points.
 *
 * @param {Array<Any>} stack The active stack, most recent on top.
 * @param {String} claimType Member of [claimTypes].
 * @return {Int} Maximum points that can be claimed.
 */
function autoScoreStackForClaimType(stack, claimType) {
  switch (claimType) {
    case "flush":
      // can't get flushes in play
      return 0;

    case "15":
      return totalPoints(stack) === 15 ? 2 : 0;

    default:
      let best = longestSuchClaim(stack, claimType);
      return best ? pointsForClaim(claimType, best) : 0;
  }
}

/** Find all possible ways to get points from this claim type.
 * Ex: with 2, 3, 3, 4, 5 and claim of "run", would find 2 runs 2, 3, 4, 5 for 8 points.
 *
 * @param {Array<Any>} hand The cards (intended as hand or crib, plus starter) to search.
 * @param {String} claimType Member of [claimTypes].
 * @param {Boolean} isCrib Whether this is the crib -- matters for flushes.
 * @returns {Int} How many points of this claim type.
 */
function autoScoreHandForClaimType(hand, starter, claimType, isCrib = false) {
  switch (claimType) {
    case "15":
      return scoreHandFor15s(hand, starter);

    case "kind":
      return scoreHandForKinds(hand, starter);

    case "run":
      return scoreHandForRuns(hand, starter);

    case "flush":
      return scoreHandForFlushes(hand, starter, isCrib);

    default:
      return 0;
  }
}

//// Scoring Helpers ////

/**
 * Checks whether all the cards together form the claim.
 * Doesn't account for the context of where the cards came from, so it won't
 * decline 4 cards from the crib from being a flush, or 3 cards from being a
 * run when the longest run in the original hand has length 4, for example.
 *
 * @param {Array<Object>} unorderedCards The cards being used in the claim.
 * @param {String} claimType Member of [claimTypes].
 * @returns {Boolean} Whether the claim is valid.
 */
function checkClaim(unorderedCards, claimType) {
  if (unorderedCards.length < 2) return false;

  switch (claimType) {
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
      console.error("checkClaim couldn't match claim:", claimType);
  }
  return false;
}

/** Given (the size of) a valid claim, how many points does it get.
 *
 * @param {String} claimType Member of [claimTypes].
 * @param {Int} claim The number of cards used in the claim.
 * @returns The number of points this claim gets, assuming it is valid.
 */
function pointsForClaim(claimType, claim) {
  switch (claimType) {
    case "kind":
      switch (claim) {
        case 2:
          return 2;
        case 3:
          return 6;
        case 4:
          return 12;
        default:
          return 0;
      }

    case "15":
      return 2;

    // run, flush
    default:
      return claim;
  }
}

/** Find the longest such claim, for automatic scoring during play phase.
 *
 * @param {Array<Any>} orderedCards The sorted cards being used in the claim; will examine end-segments.
 * @param {String} claimType Member of [claimTypes].
 * @returns {Int?} Maximum number cards on top which form a valid such claim.
 */
function longestSuchClaim(orderedCards, claimType) {
  // can't score flushes in play stage
  if (claimType === "flush") return null;

  // start with the longest end-segment; first found will be best
  for (let i = 0; i < orderedCards.length - 1; i++) {
    if (checkClaim(orderedCards.slice(i), claimType)) {
      return orderedCards.length - i;
    }
  }

  // didn't find anything
  return null;
}

function scoreHandFor15s(hand, starter) {
  let unorderedCards = [...hand];
  unorderedCards.push(starter);
  let points = 0;
  // iterate over all subsets, via binary codes (could be more efficient)
  for (let code = 0; code < 2 ** 5; code++) {
    let cards = [];
    // create the subset corresponding to the code
    for (let ind = 0; ind < 5; ind++) {
      if (getBit(code, ind)) cards.push(unorderedCards[ind]);
    }
    // check the subset
    if (checkClaim(cards, "15")) points += pointsForClaim("15", cards.length);
  }
  return points;
}

function scoreHandForKinds(hand, starter) {
  let unorderedCards = [...hand];
  unorderedCards.push(starter);
  let points = 0;
  // find the ranks
  let ranks = unorderedCards.map((card) => card.rank.index);
  let uniqueRanks = _.uniq(ranks);
  // for each unique rank, count how many of that rank there are and score that
  for (let rank of uniqueRanks) {
    points += pointsForClaim(
      "kind",
      ranks.filter((rank2) => rank2 === rank).length
    );
  }
  return points;
}

function scoreHandForRuns(hand, starter) {
  let unorderedCards = [...hand];
  unorderedCards.push(starter);
  // if there are runs, they are all the same length, so go by length, stopping at the first non-zero
  for (let len = 5; len >= 3; len--) {
    let points = 0;

    // iterate over all subsets of size len, via binary codes (could be more efficient)
    for (let code = 0; code < 2 ** 5; code++) {
      // skip wrong sizes
      if (bitCount(code, 5) !== len) continue;

      let cards = [];
      // create the subset corresponding to the code
      for (let ind = 0; ind < 5; ind++) {
        if (getBit(code, ind)) cards.push(unorderedCards[ind]);
      }
      // check the subset
      if (checkClaim(cards, "run")) {
        points += pointsForClaim("run", cards.length);
      }
    }

    if (points > 0) return points;
  }

  // no runs
  return 0;
}

function scoreHandForFlushes(hand, starter, isCrib = false) {
  let handSuits = hand.map((card) => card.suit.index);
  let starterSuit = starter.suit.index;
  // if all 5 are the same suit
  if (_.uniq(handSuits).length === 1 && handSuits[0] === starterSuit) return 5;

  // crib can only score with all 5
  if (isCrib) return 0;

  // hand must have 4 of the same suit
  if (_.uniq(handSuits).length === 1) return 4;

  // nothing
  return 0;
}

//// Bit Manipulation ////

// not really card helpers...

function getBit(code, bit) {
  // logical-and the code with ..0001000...
  return code & (1 << bit) ? 1 : 0;
}

function bitCount(code, max) {
  return [...Array(max).keys()].reduce(
    (partialSum, ind) => partialSum + getBit(code, ind),
    0
  );
}

//// Other ////

// NOTE: originally from useRound
// // may check opponent's hand, so need player param (-1 for crib)
// /**
//  * Checks if specified cards in specified hand/crib add up to 15,
//  * form a run, are _-of-a-kind, or form a (valid) flush.
//  *
//  * @param {int} player Index of player, or -1 for crib.
//  * @param {Array<int>} indices Indices of cards in hand/crib plus starter.
//  * @param {string} claim "15", "run", "kind", or "flush"
//  */
// function canScorePoints(player, indices, isUsingStarter, claim) {
//   let isCrib = !hands[player];
//   let amount = indices.length;

//   let hand = hands[player] || crib;
//   let cards = hand.filter((_, index) => indices.includes(index));
//   if (isUsingStarter) cards.push(starter);

//   // flush considerations

//   // crib can only score a flush with all 5 cards
//   if (isCrib && claim === "flush" && amount !== 5) return false;

//   // 4-card flush cannot use starter
//   if (claim === "flush" && amount === 4 && isUsingStarter) return false;

//   // NOTE: avoid double-counting sub-kinds and sub-runs and sub-flushes

//   return checkClaim(cards, claim);
// }

export {
  // constants
  allCards,
  claimTypes,
  // basic card manipulation
  shuffle,
  cardSorter,
  totalPoints,
  // scoring functions
  checkClaim,
  pointsForClaim,
  autoScoreHandForClaimType,
  autoScoreStackForClaimType,
};

export { getBit as getBitTest, bitCount as bitCountTest };

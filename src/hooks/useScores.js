import { useReducer, useEffect } from "react";
import {
  totalPoints,
  claimTypes,
  checkClaim,
  pointsForClaim,
  autoScoreHandForClaimType,
  autoScoreStackForClaimType,
} from "../playing-cards/cardHelpers";

import Rank from "../playing-cards/Rank";
import Action from "./Action";

//// Constants ////

const WIN_LINE = 120; // 20; // 120;
const SKUNK_LINE = 90; // 15; // 90;
const DOUBLE_SKUNK_LINE = 60; // 10; // 60;
const TRIPLE_SKUNK_LINE = 30; // 5; // 30;

//// Helpers ////

function initialScores(playerCount) {
  return {
    current: Array(playerCount).fill(0), // current (1st peg)
    previous: Array(playerCount).fill(-1), // previous (2nd peg)
  };
}

//// Reducers ////

function scoresReducer(
  { current, previous },
  { type, player, points, playerCount }
) {
  if (type === "reset") return initialScores(playerCount);

  let newPrevious = [...previous];
  let newCurrent = [...current];
  switch (type) {
    case "increment":
      if (points <= 0) break; // don't move any pegs if "pegging" 0
      newPrevious[player] = current[player];
      newCurrent[player] += points;
      break;

    default:
      console.error("scoresReducer couldn't recognize action type", type);
  }
  return { current: newCurrent, previous: newPrevious };
}

//// Hook ////

export function useScores(
  playerCount,
  dealer,
  starter,
  crib,
  hands,
  sharedStack,
  previousPlayer,
  previousAction,
  isCurrentPlayOver
) {
  //// States ////

  // the most recent two scores for each player (correspond to peg positions)
  const [{ current, previous }, dispatchScores] = useReducer(
    scoresReducer,
    playerCount,
    initialScores
  );

  //// Constants ////

  const stackTotal = totalPoints(sharedStack);

  const winner = current.findIndex((score) => WIN_LINE < score);
  const hasWinner = winner !== -1;
  const nonSkunkCount = hasWinner
    ? current.filter((score) => SKUNK_LINE < score && score <= WIN_LINE).length
    : 0;
  const skunkCount = hasWinner
    ? current.filter(
        (score) => DOUBLE_SKUNK_LINE < score && score <= SKUNK_LINE
      ).length
    : 0;
  const doubleSkunkCount = hasWinner
    ? current.filter(
        (score) => TRIPLE_SKUNK_LINE < score && score <= DOUBLE_SKUNK_LINE
      ).length
    : 0;
  const tripleSkunkCount = hasWinner
    ? current.filter((score) => score <= TRIPLE_SKUNK_LINE).length
    : 0;

  //// Helpers ////

  function peg(player, points) {
    dispatchScores({ type: "increment", player, points });
  }

  //// Effects ////

  // reset if player count changes
  useEffect(() => {
    dispatchScores({ type: "reset", playerCount });
  }, [playerCount]);

  // peg 2 for cutting a jack
  useEffect(() => {
    if (starter && starter.rank === Rank.JACK) {
      peg(dealer, 2);
    }
  }, [dealer, starter]);

  // peg after playing a card
  //  combine into one big effect so that all points are in a single pegging
  useEffect(() => {
    if (previousAction === Action.PLAY) {
      let points = 0;

      // 15s, kinds, runs
      for (let claimType of claimTypes) {
        if (claimType === "flush") continue;
        let claim = "auto"; // TODO: SCORING: allow manual scoring - get claim from outside

        if (claim === "auto") {
          points += autoScoreStackForClaimType(sharedStack, claimType);
        } else if (Number.isInteger(claim) || claim === "all") {
          claim = claim === "all" ? sharedStack.length : claim;
          let sliceAmount = sharedStack.length - claim;
          if (checkClaim(sharedStack.slice(sliceAmount), claimType)) {
            points += pointsForClaim(claimType, claim);
          }
        }
      }

      // end of play?
      if (isCurrentPlayOver) {
        points += stackTotal === 31 ? 2 : 1;
      }

      // peg all points at once
      peg(previousPlayer, points);
    }
  }, [
    previousAction,
    previousPlayer,
    sharedStack,
    isCurrentPlayOver,
    stackTotal,
  ]);

  // peg after a go which ends a play
  useEffect(() => {
    if (previousAction === Action.GO && isCurrentPlayOver) {
      peg(previousPlayer, 1);
    }
  }, [previousAction, isCurrentPlayOver, previousPlayer]);

  // score a hand (or the crib)
  useEffect(() => {
    if ([Action.SCORE_HAND, Action.SCORE_CRIB].includes(previousAction)) {
      let isCrib = previousAction === Action.SCORE_CRIB;
      let hand = isCrib ? [...crib] : [...hands[previousPlayer]];

      let points = 0;

      // TODO: SCORING: refactor to allow manual scoring

      for (let claimType of claimTypes) {
        points += autoScoreHandForClaimType(hand, starter, claimType, isCrib);
      }

      // his nobs: score jack with same colour as starter
      if (
        hand.some(
          (card) => card.rank === Rank.JACK && card.suit === starter.suit
        )
      ) {
        points += 1;
      }

      peg(previousPlayer, points);
    }
  }, [previousAction, previousPlayer, starter, crib, hands, dealer]);

  //// Return Functions ////

  function reset() {
    dispatchScores({ type: "reset", playerCount });
  }

  //// Return ////

  // TODO: provide details of most recent pegging, to be observed by hsitory logger?

  return {
    current,
    previous,

    hasWinner,
    winner,
    nonSkunkCount,
    skunkCount,
    doubleSkunkCount,
    tripleSkunkCount,

    reset,

    // for testing // TODO: NEXT: review this, and tests
    pegTest: peg,
  };
}

//// TODO: old code for validation from useRound

// function isValidPlay(index, claim, amount = sharedStack.length + 1) {
//   const card = hands[nextPlayer][index];

//   // can't play if it goes over 31
//   if (stackTotal + card.rank.points > 31) return false;

//   // if no claim (for points) then it's good
//   if (!claim) return true;

//   // can't claim if stack doesn't have enough cards
//   if (sharedStack.length + 1 < amount) return false;

//   const cards = [...sharedStack.slice(sharedStack.length - amount - 1), card];

//   // now check claim
//   return checkClaim(cards, claim);
// }

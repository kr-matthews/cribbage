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

//// Constants ////

// TEMP: scoring lines
const WIN_LINE = 20; //121;
const SKUNK_LINE = 15; //90;
const DOUBLE_SKUNK_LINE = 10; //60;
const TRIPLE_SKUNK_LINE = 5; //30;

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
      if (points <= 0) break; // don't move the 2nd peg if "pegging" 0
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
  justPlayed,
  previousPlayer,
  previousScorer,
  areAllInactive,
  hands,
  crib,
  starter,
  sharedStack
) {
  //// Constants and States ////

  const stackTotal = totalPoints(sharedStack);

  // the most recent two scores for each player (correspond to peg positions)
  const [{ current, previous }, dispatchScores] = useReducer(
    scoresReducer,
    playerCount,
    initialScores
  );

  const winner = current.findIndex((score) => score > WIN_LINE);
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

  //

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

  // peg after **playing a card**
  //  combine into one big effect so that all points are in a single pegging
  useEffect(() => {
    if (justPlayed && stackTotal > 0) {
      let points = 0;

      // 15s, kinds, runs
      for (let claimType of claimTypes) {
        if (claimType === "flush") continue;
        let claim = "auto"; // TODO: SCORING: allow manual scoring

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
      if (areAllInactive) {
        points += stackTotal === 31 ? 2 : 1;
      }

      // peg all points at once
      peg(previousPlayer, points);
    }
  }, [areAllInactive, previousPlayer, justPlayed, sharedStack, stackTotal]);

  // peg after ending play via **explicit go**
  useEffect(() => {
    if (areAllInactive && !justPlayed) {
      peg(previousPlayer, 1);
    }
  }, [areAllInactive, justPlayed, previousPlayer]);

  // TODO: NEXT: NEXT: NEXT: find flaw - try 5D 5H 6C 7S plus 4S

  // score a hand (or the crib)
  useEffect(() => {
    if (previousScorer !== null) {
      let isCrib = ![0, 1, 2].slice(0, playerCount).includes(previousScorer);
      let player = isCrib ? dealer : previousScorer;
      let points = 0;
      let hand = isCrib ? [...crib] : [...hands[previousScorer]];

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

      peg(player, points);
    }
  }, [previousScorer, starter, crib, hands, dealer, playerCount]);

  //// Return Functions ////

  function peg(player, points) {
    dispatchScores({ type: "increment", player, points });
  }

  function reset() {
    dispatchScores({ type: "reset", playerCount });
  }

  //// Return ////

  return {
    current,
    previous,

    winner,
    nonSkunkCount,
    skunkCount,
    doubleSkunkCount,
    tripleSkunkCount,

    reset,

    // for testing
    pegTest: peg,
  };
}

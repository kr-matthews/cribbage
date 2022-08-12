import { useReducer, useEffect } from "react";

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
    delta: 0, // updates even when pegging 0 (unlike current - previous)
    scorer: null, // who scored last - needed for pegging 1 for being last to play
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
  let newDelta = 0; // default, for when scored 0

  switch (type) {
    case "increment":
      // only update pegs and calculate delta when applicable
      if (points > 0) {
        newPrevious[player] = current[player];
        newCurrent[player] += points;
        newDelta = newCurrent[player] - newPrevious[player];
      }
      break;

    default:
      console.error("scoresReducer couldn't recognize action type", type);
  }
  return {
    current: newCurrent,
    previous: newPrevious,
    delta: newDelta,
    scorer: player,
  };
}

//// Hook ////

export function useScores(playerCount) {
  //// States ////

  // the most recent two scores for each player (correspond to peg positions)
  const [{ current, previous, delta, scorer }, dispatchScores] = useReducer(
    scoresReducer,
    playerCount,
    initialScores
  );

  //// Constants ////

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

  //// Effects ////

  // reset if player count changes
  useEffect(() => {
    dispatchScores({ type: "reset", playerCount });
  }, [playerCount]);

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
    delta,
    scorer,

    hasWinner,
    winner,
    nonSkunkCount,
    skunkCount,
    doubleSkunkCount,
    tripleSkunkCount,

    peg,
    reset,
  };
}

//// todo old code for validation from useRound

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

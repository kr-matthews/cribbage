import { useReducer } from "react";

//// Constants

const INITIAL_SCORES = {
  current: [0, 0, 0], // current (1st peg)
  previous: [0, 0, 0], // previous (2nd peg)
};

//// Reducers

function scoresReducer({ current, previous }, { type, player, points }) {
  let newPrevious = [...previous];
  let newCurrent = [...current];
  switch (type) {
    case "reset":
      return INITIAL_SCORES;

    case "increment":
      newPrevious[player] = current[player];
      newCurrent[player] += points;
      break;

    default:
      console.debug("scoresReducer couldn't recognize action type", type);
  }
  return { current: newCurrent, previous: newPrevious };
}

//// Hook

export function useScores() {
  //// Constants and States

  // the most recent two scores for each player (correspond to peg positions)
  const [{ current, previous }, dispatchScores] = useReducer(
    scoresReducer,
    INITIAL_SCORES
  );

  const hasWinner = current.some((score) => score > 120);
  const winner =
    current[0] > 120 ? 0 : current[1] > 120 ? 1 : current[2] > 120 ? 2 : null;

  //// Helpers

  //

  //// Return Functions

  function peg(player, points) {
    dispatchScores({ type: "reset", player, points });
  }

  function reset() {
    dispatchScores({ type: "reset" });
  }

  //// Return

  return {
    current,
    previous,
    peg,
    hasWinner,
    winner,
    reset,
  };
}

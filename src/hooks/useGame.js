import { useState, useReducer } from "react";

import { useRound } from "./useRound.js";

//// Reducers

const INITIAL_SCORES = [0, 0, 0];

function scoresReducer(state, action) {
  let newState = [...state];
  switch (action.type) {
    case "reset":
      return INITIAL_SCORES;
    case "increment":
      newState[action.player] += action.points;
      break;
    default:
      console.debug("scoresReducer couldn't recognize action", action);
  }
  return newState;
}

export function useGame() {
  // game status: reset, ongoing, over
  // reset means current players haven't start a game yet
  // over shows end state of prior game
  const [status, setStatus] = useState("reset");

  // current dealer, via player index
  const [dealer, setDealer] = useState(0); // TODO: initial dealer (from cut or prev game)

  // current scores
  const [scores, dispatchScores] = useReducer(INITIAL_SCORES, scoresReducer);

  // the game plays rounds until someone wins
  const round = useRound();

  //// Helpers

  //

  //// Functions to return

  //

  //// Return

  return { status };
}

//// Possible actions:
// start
// cut for deal
// deal
// send to crib
// cut
// flip
// play (possibly suboptions: play _-of-a-kind, play run-of-_, play 31, play)
// go
// [scoring] 15, pair, run, flush, his nobs, submit points
// [opp scoring] accept score, claim missed points
// [claiming] 15, pair, run, flush, his nobs, submit points

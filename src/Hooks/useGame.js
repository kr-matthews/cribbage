import { useState, useReducer } from "react";

import { useRound } from "./useRound.js";

//// Reducers

const INITIAL_SCORES = [0, 0, 0];
function scoresReducer(state, action) {
  switch (action.type) {
    case "reset":
      return INITIAL_SCORES;
    case "increment":
      let newState = [...state];
      newState[action.player] += action.points;
      return newState;
    default:
      console.debug("scoresReducer couldn't recognize action", action);
  }
}

export function useGame() {
  //// Constants and States

  // game status: reset, ongoing, over
  // reset means current players haven't start a game yet
  // over shows end state of prior game
  const [status, setStatus] = useState("reset");

  // current dealer, via player index
  const [dealer, setDealer] = useState(0);

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
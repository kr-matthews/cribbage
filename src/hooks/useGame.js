import { useState, useReducer } from "react";

import { useDeck } from "./useDeck.js";
import { useRound } from "./useRound.js";
import { useScores } from "./useScores.js";

//// Reducers

//

export function useGame() {
  // game status: reset, ongoing, over
  //   reset means current players haven't start a game yet
  //   over shows end state of prior game
  const [status, setStatus] = useState("reset");

  // the deck, only used by player 0
  const deck = useDeck();

  // current dealer, via player index
  const [dealer, setDealer] = useState(0); // TODO: initial dealer (from cut or prev game)

  // current scores
  const scores = useScores();

  // the game plays rounds until someone wins
  const round = useRound();

  //// Helpers

  //

  //// Functions to return

  //

  //// Return

  return { status, dealer, scores };
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

import { useState } from "react";

import { useDeck } from "./useDeck.js";
import { useRound } from "./useRound.js";
import { useScores } from "./useScores.js";

//// Reducers

//

export function useGame(playerCount, isOwner) {
  //// Constants and States

  // game status: reset, ongoing, over
  //   reset means current players haven't start a game yet
  //   over shows end state of prior game
  const [status, setStatus] = useState("reset");

  // current dealer, via player index
  const [dealer, setDealer] = useState(0); // TODO: initial dealer (from cut or prev game)

  //// Custom Hooks

  // current scores
  const scores = useScores();

  // the deck, only used by game owner
  const deck = useDeck();

  // the game plays rounds until someone wins
  const round = useRound(playerCount, dealer, deck);

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
// repeat (a round):
//  deal
//  send to crib
//  cut
//  flip
//  play - suboptions: play, for 15, for _-of-a-kind, for a-run-of-_) -- CAN HAVE MUTLTIPLE (ex: 5, 4, 6)
//  go
//  [scoring] 15, pair, run, flush, his nobs, submit points
//  [opp scoring] accept score, claim missed points
//  [claiming] 15, pair, run, flush, his nobs, submit points
//  reset
// new game

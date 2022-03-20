import { useState, useEffect } from "react";

import { useRound } from "./useRound.js";
import { useScores } from "./useScores.js";

import Action from "./Action.js";

// TODO: NEXT: NEXT: put next player/action logic in correct locations (split across files)

////// Hook //////

export function useGame(
  deck,
  playerCount,
  nextPlayer,
  nextAction,
  dispatchNextPlay,
  isOwner
) {
  //// Constants and States ////

  // current dealer, via player index
  const [dealer, setDealer] = useState(null);

  //// Custom Hooks ////

  // current scores
  const scores = useScores();

  // the game plays rounds until someone wins
  const round = useRound(
    deck,
    playerCount,
    dealer,
    setDealer,
    nextPlayer,
    nextAction,
    dispatchNextPlay
  );

  //// Effects ////

  // reset if player count changes
  useEffect(() => {
    dispatchNextPlay({ type: "reset", playerCount });
  }, [playerCount, dispatchNextPlay]);

  //// Helpers ////

  //

  //// Functions to return ////

  // QUESTION: is this needed?
  /** for starting with a new set of players; all history erased */
  function reset() {
    scores.reset();
    dispatchNextPlay({ type: "reset", playerCount });
    setDealer(null);
  }

  /** locking in players for a fresh game */
  function start(cards) {
    round.reset(cards);
    dispatchNextPlay({ player: dealer, action: Action.START_DEALING });
  }

  /** for starting rematch with same players (loser goes first, gamePoints preserved) */
  function rematch(cards) {
    round.reset(cards);
    scores.reset();
    dispatchNextPlay({
      // loser had new-game power, and now gets to deal it
      player: nextPlayer,
      action: Action.START_DEALING,
    });
  }

  //// Return ////

  return {
    // score
    currentScores: scores.current,
    previousScores: scores.previous,

    // game
    dealer,
    setDealer,
    nextAction,
    start,
    rematch,

    // round
    crib: round.crib,
    hands: round.hands,
    piles: round.piles,
    starter: round.starter,

    isValidGo: round.isValidGo,
    isValidPlay: round.isValidPlay,
    // TODO: round.canScorePoints ?

    resetRound: round.reset,
    deal: round.deal,
    discardToCrib: round.discardToCrib,
    cut: round.cut,
    flip: round.flip,
    play: round.play,
    go: round.go,
    scoreHand: round.scoreHand,
    scoreCrib: round.scoreCrib,
    restartRound: round.restart,

    proceed: round.proceed, //...
  };
}

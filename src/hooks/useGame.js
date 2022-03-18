import { useState, useEffect } from "react";

import { useRound } from "./useRound.js";
import { useScores } from "./useScores.js";

import Action from "./Action.js";

// TODO: NEXT: NEXT: move next player/action states to app, to share with cut for deal
// TODO: NEXT: NEXT: put next player/action logic in correct locations (split across files)
// TODO: NEXT: finish cut-for-deal stage entirely

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
    // TODO: NEXT: move validation checks to App
    if (2 <= playerCount && playerCount <= 3) {
      round.reset(cards);
      dispatchNextPlay({ player: 0, action: Action.CUT_FOR_DEAL });
    } else {
      alert("The game can only be played with 2 or 3 players.");
    }
  }

  /** for starting rematch with same players (loser goes first, gamePoints preserved) */
  function rematch(cards) {
    round.reset(cards);
    scores.reset();
    dispatchNextPlay({
      // loser had new-game power, and now gets to deal it
      player: nextPlayer,
      action: Action.DEAL,
    });
  }

  // TEMP
  function tempcut(player, dealer) {
    if (player === playerCount - 1) {
      dispatchNextPlay({ player: dealer, action: Action.PROCEED_DEAL });
    } else {
      dispatchNextPlay({ type: "next" });
    }
  }

  //// Return ////

  return {
    // score
    currentScores: scores.current,
    previousScores: scores.previous,

    // game
    dealer,
    nextAction,
    start,
    rematch,
    tempcut,

    // round
    deal: round.deal,
    sendToCrib: round.sendToCrib,
    cut: round.cut,
    flip: round.flip,
    isValidPlay: round.isValidPlay,
    play: round.play,
    isValidGo: round.isValidGo,
    go: round.go,
    proceed: round.proceed,
    scoreHand: round.scoreHand,
    scoreCrib: round.scoreCrib,
    restartRound: round.restart,
    resetRound: round.reset,
    crib: round.crib,
    hands: round.hands,
    piles: round.piles,
    starter: round.starter,
  };
}

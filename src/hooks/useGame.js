import { useState } from "react";

import { useRound } from "./useRound.js";
import { useScores } from "./useScores.js";

import Action from "./Action.js";

////// Hook //////

export function useGame(
  deck,
  playerCount,
  nextPlayer,
  nextAction,
  dispatchNextPlay
) {
  //// Constants and States ////

  // current dealer, via player index
  const [dealer, setDealer] = useState(null);

  //// Custom Hooks ////

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

  // current scores
  const scores = useScores(
    playerCount,
    dealer,
    round.justPlayed,
    round.previousPlayer,
    round.previousScorer,
    round.areAllInactive,
    round.hands,
    round.crib,
    round.starter,
    round.sharedStack,
    { 15: "auto", kind: "auto", run: "auto" } // TODO: NEXT: fix claims methodology
  );

  //// Effects ////

  //

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
  function start(firstDealer, cards) {
    round.reset(cards);
    dispatchNextPlay({ player: firstDealer, action: Action.START_DEALING });
    setDealer(firstDealer);
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
    start,
    rematch,

    // round
    crib: round.crib,
    hands: round.hands,
    piles: round.piles,
    starter: round.starter,

    isValidGo: round.isValidGo,
    isValidPlay: round.isValidPlay,
    // round.canScorePoints // TODO?

    resetRound: round.reset,
    deal: round.deal,
    discardToCrib: round.discardToCrib,
    cut: round.cut,
    flip: round.flip,
    play: round.play,
    go: round.go,
    endPlay: round.endPlay,
    returnToHand: round.returnToHand,
    scoreHand: round.scoreHand,
    scoreCrib: round.scoreCrib,
    restartRound: round.restart,
  };
}

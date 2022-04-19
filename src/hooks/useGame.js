import { useState } from "react";

import { useRound } from "./useRound.js";
import { useScores } from "./useScores.js";

import Action from "./Action.js";

////// Hook //////

export function useGame(deck, playerCount, nextPlayer, nextAction) {
  //// Constants and States ////

  // current dealer, via player index
  const [dealer, setDealer] = useState(null);

  //// Custom Hooks ////

  // the game plays rounds until someone wins
  const round = useRound(deck, playerCount, dealer);

  // current scores
  const scores = useScores(
    playerCount,
    dealer,
    round.starter,
    round.crib,
    round.hands,
    round.sharedStack,
    round.previousPlayer,
    round.previousAction,
    round.previousCardPlayedBy,
    round.isCurrentPlayOver
  );

  //// Effects ////

  // stop game once someone wins // TODO: refactor into next action calculation
  // useEffect(() => {
  //   if (scores.winner !== -1) {
  //     // loser gets to deal next game, so they get power to start next game
  //     dispatchNextPlay({
  //       action: Action.START_NEW_GAME,
  //       player: scores.winner + 1,
  //     });
  //   }
  // }, [scores.winner]);

  //// Helpers ////

  //

  //// Functions to return ////

  /** for starting fresh; all history erased */
  function reset() {
    scores.reset();
    round.reset();
    setDealer(null);
    setPreviousPlayerAction({ player: nextPlayer, action: Action.RESET_ALL });
  }

  /** locking in players for a fresh game */
  function start(firstDealer, cards) {
    round.reset(cards);
    setPreviousPlayerAction({
      player: nextPlayer,
      action: Action.START_FIRST_GAME,
    });
    setDealer(firstDealer);
  }

  /** for starting rematch with same players (loser goes first, gamePoints preserved) */
  function rematch(cards) {
    round.reset(cards);
    scores.reset();
    // loser already is the next player, now formally assign them as dealer
    setDealer(nextPlayer);
    setPreviousPlayerAction({
      player: nextPlayer,
      action: Action.START_NEW_GAME,
    });
  }

  //// Return ////

  return {
    // scores
    currentScores: scores.current,
    previousScores: scores.previous,
    winner: scores.winner,
    nonSkunkCount: scores.nonSkunkCount,
    skunkCount: scores.skunkCount,
    doubleSkunkCount: scores.doubleSkunkCount,
    tripleSkunkCount: scores.tripleSkunkCount,

    // game
    dealer,
    setDealer,
    start,
    rematch,
    reset,

    // round
    crib: round.crib,
    hands: round.hands,
    piles: round.piles,
    starter: round.starter,

    isValidGo: round.isValidGo,
    isValidPlay: round.isValidPlay,

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

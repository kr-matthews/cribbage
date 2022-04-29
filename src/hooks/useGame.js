import { useState } from "react";
import Action from "./Action.js";

import { useRound } from "./useRound.js";
import { useScores } from "./useScores.js";

////// Hook //////

export function useGame(deck, playerCount, previousPlayerAction) {
  //// States ////

  // current dealer, via player index
  const [dealer, setDealer] = useState(null);

  // the game plays rounds until someone wins
  const round = useRound(deck, playerCount, dealer, previousPlayerAction);

  // previous player and action
  const {
    previousPlayer,
    previousAction,
    makePlayerArray,
    setPreviousPlayerAction,
  } = previousPlayerAction;

  // current scores
  const scores = useScores(
    playerCount,
    dealer,
    round.starter,
    round.crib,
    round.hands,
    round.sharedStack,
    previousPlayer,
    previousAction,
    round.isCurrentPlayOver
  );

  //// Next Action ////

  const [nextPlayers, nextAction] = (() => {
    if (scores.hasWinner) {
      // somebody won the game (possibly mid-round), it's over
      return [null, null];
    } else if (round.nextAction !== null) {
      // the round is ongoing
      return [round.nextPlayers, round.nextAction];
    } else {
      // the round is over (and nobody has won the game)
      return [makePlayerArray(dealer + 1), Action.START_NEW_ROUND];
    }
  })();

  const nextPlayer = nextPlayers ? nextPlayers.indexOf(true) : null;

  //// Actions ////

  /** for starting fresh; all history erased */
  function reset(newDealer = null) {
    round.reset();
    scores.reset();
    setDealer(newDealer);
  }

  // /** locking in players for a fresh game */
  // function start(dealer) {
  //   round.reset();
  //   setDealer(dealer);
  //   scores.reset();
  //   setPreviousPlayerAction(nextPlayer, Action.START_FIRST_GAME);
  // }

  function startNextRound() {
    round.reset();
    setDealer((dealer) => (dealer + 1) % playerCount);
    setPreviousPlayerAction(nextPlayer, Action.START_NEW_ROUND);
  }

  // /** for starting rematch with same players (loser goes first, gamePoints preserved) */
  // function rematch() {
  //   round.reset();
  //   scores.reset();
  //   setDealer(rematchDealer);
  //   setPreviousPlayerAction(nextPlayer, Action.START_NEW_GAME);
  // }

  //// Return ////

  return {
    // UI data
    crib: round.crib,
    hands: round.hands,
    piles: round.piles,
    starter: round.starter,

    // logic data
    nextPlayers,
    nextAction,
    dealer,

    // scores
    currentScores: scores.current,
    previousScores: scores.previous,
    winner: scores.winner,
    nonSkunkCount: scores.nonSkunkCount,
    skunkCount: scores.skunkCount,
    doubleSkunkCount: scores.doubleSkunkCount,
    tripleSkunkCount: scores.tripleSkunkCount,

    // checks
    isValidGo: round.isValidGo,
    isValidPlay: round.isValidPlay,

    // actions
    reset,
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
    startNextRound,
  };
}

// TODO: add tests, primarily that actions line up and dealer is correct on new games/rounds

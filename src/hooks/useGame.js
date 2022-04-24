import { useCallback, useEffect, useState } from "react";
import Action from "./Action.js";

import { useRound } from "./useRound.js";
import { useScores } from "./useScores.js";

////// Hook //////

export function useGame(deck, playerCount) {
  //// States ////

  // current dealer, via player index
  const [dealer, setDealer] = useState(null);

  const [{ previousPlayer, previousAction }, setPreviousPlayerAction] =
    useState({ previousPlayer: null, previousAction: null });

  // Custom Hooks //

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
    round.isCurrentPlayOver
  );

  //// Constants ////

  const rematchDealer = scores.hasWinner
    ? (scores.winner + 1) % playerCount
    : null;

  //// Helpers ////

  // TODO: copied from useRound - extract as helper function
  function makePlayerArray(player) {
    let arr = Array(playerCount).fill(false);
    // player might be negative
    arr[(player + playerCount) % playerCount] = true;
    return arr;
  }

  //// Next Action ////

  const [nextPlayers, nextAction] = (() => {
    if (scores.hasWinner) {
      return [makePlayerArray(rematchDealer), Action.START_NEW_GAME];
    } else if (dealer === null) {
      return [makePlayerArray(0), Action.START_FIRST_GAME];
    } else if (round.nextAction !== null) {
      return [round.nextPlayers, round.nextAction];
    } else {
      return [makePlayerArray(dealer + 1), Action.START_NEW_ROUND];
    }
  })();

  const nextPlayer = nextPlayers ? nextPlayers.indexOf(true) : null;

  // TODO: copied from useRound - extract as custom hook
  const setPreviousAction = useCallback(
    (previousAction) =>
      setPreviousPlayerAction({ previousPlayer: nextPlayer, previousAction }),
    [setPreviousPlayerAction, nextPlayer]
  );

  //// Effects ////

  // observe actions from useRound (alternatively, create function for each round function returned below)
  useEffect(() => {
    if (round.previousAction !== null) {
      setPreviousPlayerAction(round.previousPlayer, round.previousAction);
    }
  }, [round.previousPlayer, round.previousAction]);

  //// Functions to return ////

  /** for starting fresh; all history erased */
  function reset() {
    round.reset();
    setDealer(null);
    scores.reset();
    setPreviousAction(Action.RESET_ALL);
  }

  /** locking in players for a fresh game */
  function start(dealer) {
    round.reset();
    setDealer(dealer);
    scores.reset();
    setPreviousAction(Action.START_FIRST_GAME);
  }

  function startNextRound() {
    round.reset();
    setDealer((dealer) => (dealer + 1) % playerCount);
    setPreviousAction(Action.START_NEW_ROUND);
  }

  /** for starting rematch with same players (loser goes first, gamePoints preserved) */
  function rematch() {
    round.reset();
    scores.reset();
    setDealer(rematchDealer);
    setPreviousAction(Action.START_NEW_GAME);
  }

  //// Return ////

  return {
    // UI data
    crib: round.crib,
    hands: round.hands,
    piles: round.piles,
    starter: round.starter,

    // logic data
    previousPlayer,
    previousAction,
    nextPlayers,
    nextAction,
    dealer,
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
    start,
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
    rematch,
  };
}

// TODO: add tests, primarily that actions line up and dealer is correct on new games/rounds

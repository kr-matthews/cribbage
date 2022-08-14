import { useState } from "react";
import { totalPoints } from "../playing-cards/cardHelpers.js";
import Action from "./Action.js";

import { useRound } from "./useRound.js";
import { useScores } from "./useScores.js";

////// Hook //////

export function useGame(
  deck,
  playerCount,
  userPosition,
  previousPlayerAction,
  debugMode = false
) {
  //// States ////

  // previous player and action
  const { makePlayerArray, setPreviousPlayerAction } = previousPlayerAction;

  // current dealer, via player index
  const [dealer, setDealer] = useState(null);

  // current scores
  const scores = useScores(playerCount);

  // the game plays rounds until someone wins
  const round = useRound(
    deck,
    playerCount,
    userPosition,
    dealer,
    previousPlayerAction,
    scores.peg,
    debugMode
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

  function startNextRound() {
    round.reset();
    setDealer((dealer) => (dealer + 1) % playerCount);
    setPreviousPlayerAction(nextPlayer, Action.START_NEW_ROUND);
  }

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

    // more data
    stackTotal: totalPoints(round.sharedStack),

    // scores
    currentScores: scores.current,
    previousScores: scores.previous,
    scoreDelta: scores.delta,
    scoreScorer: scores.scorer,
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

// todo TESTS: add tests, primarily that actions line up and dealer is correct on new games/rounds

import { useState, useReducer } from "react";

import { useDeck } from "./useDeck.js";
import { useRound } from "./useRound.js";
import { useScores } from "./useScores.js";

import Action from "./Action.js";

//// Reducers ////

function reduceNextPlay(nextPlay, { type, player, nextAction }) {
  let playerCount = nextPlay.nextPlayers.length;
  let newNextPlay = {
    // copy current players
    nextPlayers: [...nextPlay.nextPlayers],
    // use provided next action, or default to current next action
    nextAction: nextAction || nextPlay.nextAction,
  };
  switch (type) {
    case "remove":
      newNextPlay.nextPlayers[player % playerCount] = false;
      break;

    case "all":
      newNextPlay.nextPlayers = Array(playerCount).fill(true);
      break;

    case "next":
      let oldPlayer = newNextPlay.nextPlayers.indexOf(true);
      let newPlayer = (oldPlayer + 1) % playerCount;
      newNextPlay.nextPlayers[oldPlayer] = false;
      newNextPlay.nextPlayers[newPlayer] = true;
      break;

    default:
      // player and action given directly, independent of prior state
      newNextPlay.nextPlayers = Array(playerCount).fill(false);
      newNextPlay.nextPlayers[player % playerCount] = true;
      break;
  }
  return newNextPlay;
}

////// Hook //////

export function useGame(playerCount, isOwner) {
  //// Constants and States ////

  // the next action to be taken, and by who
  // (only 1 player to play next, unless discarding to crib)
  const [{ nextPlayers, nextAction }, dispatchNextPlay] = useReducer(
    reduceNextPlay,
    playerCount,
    (playerCount) => {
      let arr = Array(playerCount).fill(false);
      arr[0] = true;
      return {
        nextPlayers: arr,
        nextAction: Action.DEAL, // TEMP: Action.START
      };
    }
  );

  // current dealer, via player index
  const [dealer, setDealer] = useState(0); // TEMP: null

  //// Custom Hooks ////

  // current scores
  const scores = useScores();

  // the deck; non-owners receive a card stack to pass in later
  const deck = useDeck();

  // the game plays rounds until someone wins
  const round = useRound(
    playerCount,
    dealer,
    nextPlayers.indexOf(true), // nextPlayer
    nextAction,
    dispatchNextPlay,
    deck
  );

  //// Helpers ////

  //

  //// Functions to return ////

  function start(cards) {
    if (2 <= playerCount && playerCount <= 3) {
      // TODO: prevent new players from joining/being added
      // if owner started game remotely, then they sent the deck configuration
      if (cards) deck.reset(cards);
      // TOOD: NEXT: update next action
    }
  }

  function cutForDeal() {
    // TODO
  }

  //// Return ////

  return {
    // score
    currentScores: scores.current,
    previousScores: scores.previous,

    // deck
    deckSize: deck.size,
    isDeckCut: deck.isCut,

    // game
    dealer,
    nextPlayers,
    nextAction,
    start,
    cutForDeal,

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
    resetRound: round.reset,
    crib: round.crib,
    hands: round.hands,
    piles: round.piles,
    starter: round.starter,
  };
}

// for tests
export { reduceNextPlay };

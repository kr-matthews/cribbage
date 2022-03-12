import { useState, useReducer } from "react";

import { useDeck } from "./useDeck.js";
import { useRound } from "./useRound.js";
import { useScores } from "./useScores.js";

import Action from "./Action.js";

//// Helpers ////

function initialNextPlay(playerCount) {
  let arr = Array(playerCount).fill(false);
  arr[0] = true;
  return {
    nextPlayers: arr,
    nextAction: Action.START,
  };
}

//// Reducers ////

function reduceNextPlay(nextPlay, { type, player, nextAction, playerCount }) {
  // if new game with new players, need to adjust player count
  if (type === "reset") return initialNextPlay(playerCount);

  // otherwise just use the same player count
  playerCount ||= nextPlay.nextPlayers.length;
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
    initialNextPlay
  );

  // current dealer, via player index
  const [dealer, setDealer] = useState(null);

  //// Custom Hooks ////

  // current scores
  const scores = useScores();

  // the deck; non-owners receive a card stack to pass in later
  const deck = useDeck();

  // the game plays rounds until someone wins
  const round = useRound(
    playerCount,
    dealer,
    setDealer,
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
      // TODO: reset everything
      // if owner started game remotely, then they sent the deck configuration
      deck.reset(cards);
      dispatchNextPlay({ player: 0, nextAction: Action.CUT_FOR_DEAL });
    } else {
      alert("The game can only be played with 2 or 3 players.");
    }
  }

  function cutForDeal(player) {
    // TODO: break into 2 steps
    if (nextPlayers[playerCount - 1]) {
      // last player just cut
      // TODO: deduce dealer
      const newDealer = Math.floor(Math.random() * playerCount);
      setDealer(newDealer);
      dispatchNextPlay({ player: newDealer, nextAction: Action.DEAL });
    } else {
      dispatchNextPlay({ type: "next" });
    }
  }

  //// Return ////

  return {
    // score
    currentScores: scores.current,
    previousScores: scores.previous,

    // deck
    deckSize: deck.size,
    deckBottomSize: deck.size - deck.cutCount,
    deckTopSize: deck.cutCount,
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

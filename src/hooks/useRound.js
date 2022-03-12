import { useEffect, useReducer, useState } from "react";

import Action from "./Action";

import {
  cardSorter,
  totalPoints,
  checkClaim,
} from "../playing-cards/cardHelpers.js";

//// Helpers ////

function initialStates(playerCount) {
  return {
    crib: [],
    hands: [[], [], []].slice(0, playerCount),
    piles: [[], [], []].slice(0, playerCount),
    sharedStack: [],
  };
}

//// Reducers ////

function reduceStates(states, action) {
  // if new game with new players, need to specify player count
  let playerCount = action.playerCount || states.hands.length;

  // want to create new state, not alter existing state, so make copies of all changing pieces
  let newHands = Array(playerCount);
  let newPiles = Array(playerCount);
  for (let ind = 0; ind < playerCount; ind++) {
    newHands[ind] = [...states.hands[ind]];
    newPiles[ind] = [...states.piles[ind]];
  }
  let newStates = {
    crib: [...states.crib],
    hands: newHands,
    piles: newPiles,
    sharedStack: [...states.sharedStack],
  };

  switch (action.type) {
    case "reset":
      newStates = initialStates(playerCount);
      break;

    case "deal-player":
      newStates.hands[action.player].push(action.card);
      newStates.hands[action.player].sort(cardSorter);
      break;

    case "deal-crib":
      newStates.crib.push(action.card);
      break;

    case "discard":
      let card = newStates.hands[action.player].splice(action.index, 1)[0];
      newStates.crib.push(card);
      newStates.crib.sort(cardSorter);
      break;

    case "play":
      let playedCard = newStates.hands[action.player].splice(
        action.index,
        1
      )[0];
      newStates.piles[action.player].push(playedCard);
      newStates.sharedStack.push(playedCard);
      break;

    case "re-hand":
      newStates.hands = newStates.piles;
      newStates.hands.forEach((hand) => hand.sort(cardSorter));
      newStates.piles = [[], [], []].slice(0, playerCount);
      newStates.sharedStack = [];
      break;

    case "all-goed":
      newStates.sharedStack = [];
      break;

    default:
      console.error("reduceStates couldn't match action:", action);
      break;
  }
  return newStates;
}

function reduceGoed(goed, action) {
  let newGoed = new Set(goed);
  switch (action.type) {
    case "reset":
      newGoed = new Set();
      break;

    case "add":
      newGoed.add(action.player);
      break;

    default:
      console.error("reduceGoed couldn't match action:", action);
      break;
  }
  return newGoed;
}

////// Hook //////

export function useRound(
  playerCount,
  dealer,
  setDealer,
  nextPlayer,
  nextAction,
  dispatchNextPlay,
  deck
) {
  //// States and Constants ////

  const [{ crib, hands, piles, sharedStack }, dispatchStates] = useReducer(
    reduceStates,
    playerCount,
    initialStates
  );

  const stackTotal = totalPoints(sharedStack); // sharedStack.reduce(
  //   (partialSum, { rank }) => partialSum + rank.points,
  //   0
  // );

  const [starter, setStarter] = useState(null);

  // who to deal to next
  const dealTo =
    playerCount === 2
      ? // 2 players
        hands[0].length + hands[1].length === 12
        ? null
        : hands[0].length > hands[1].length
        ? 1
        : 0
      : // 3 players
      crib.length === 1
      ? null
      : hands[0].length + hands[1].length + hands[2].length === 15
      ? -1
      : hands[0].length > hands[1].length
      ? 1
      : hands[1].length > hands[2].length
      ? 2
      : 0;

  // players who have goed since sharedStack last reset
  const [goed, dispatchGoed] = useReducer(reduceGoed, new Set());

  // player is active in "play" stage if has cards and hasn't goed
  const inactive = Array(playerCount)
    .fill(null)
    .map((_, player) => goed.has(player) || hands[player].length === 0);

  //// Helpers ////

  //

  //// Effects ////

  // deal
  useEffect(() => {
    if (nextAction === Action.DEALING) {
      if (dealTo === null) {
        // stop dealing
        dispatchNextPlay({ type: "all", nextAction: Action.DISCARD });
      } else if (dealTo === -1) {
        // deal to crib
        let card = deck.draw(1)[0];
        dispatchStates({ type: "deal-crib", card });
      } else {
        // deal to next player
        let card = deck.draw(1)[0];
        dispatchStates({ type: "deal-player", player: dealTo, card });
      }
    }
  }, [nextAction, dealTo, deck, dispatchNextPlay]);

  // once everyone has submitted to the crib
  useEffect(() => {
    if (nextAction === Action.DISCARD && crib.length === 4) {
      dispatchNextPlay({
        player: dealer + 1,
        nextAction: Action.CUT_FOR_STARTER,
      });
    }
  }, [nextAction, crib.length, dispatchNextPlay, dealer]);

  // skip players who are inactive (if there are still active players)
  useEffect(() => {
    if (
      [Action.PLAY, Action.PROCEED_PLAY].includes(nextAction) &&
      inactive[nextPlayer] &&
      inactive.includes(false)
    ) {
      dispatchNextPlay({ type: "next" });
    }
  }, [nextAction, nextPlayer, inactive, dispatchNextPlay]);

  // if play stage not over, once everyone is inactive (or 31 is hit), reset sharedStack
  useEffect(() => {
    if (
      nextAction === Action.PLAY &&
      (inactive.every((bool) => bool) || stackTotal === 31)
    ) {
      dispatchGoed({ type: "reset" });
      dispatchStates({ type: "all-goed" });
      dispatchNextPlay({
        player: nextPlayer,
        nextAction: Action.PROCEED_PLAY,
      });
    }
  }, [
    nextAction,
    inactive,
    stackTotal,
    dispatchGoed,
    dispatchStates,
    dispatchNextPlay,
    nextPlayer,
  ]);

  // once all cards have been played in play stage
  useEffect(() => {
    if (
      nextAction === Action.PLAY &&
      hands.every((hand) => hand.length === 0)
    ) {
      dispatchNextPlay({
        player: dealer + 1,
        nextAction: Action.PROCEED_SCORING,
      });
    }
  }, [nextAction, hands, dispatchNextPlay, dealer]);

  //// Functions ////

  function deal() {
    dispatchNextPlay({ player: dealer, nextAction: Action.DEALING });
  }

  function sendToCrib(player, indices) {
    // move cards in desc order so indices don't get changed as we go
    const descIndices = indices.sort().reverse();
    for (let index of descIndices) {
      dispatchStates({ type: "discard", player, index });
    }

    dispatchNextPlay({ type: "remove", player });
  }

  function cut() {
    deck.cut();
    dispatchNextPlay({ player: dealer, nextAction: Action.FLIP_STARTER });
  }

  function flip() {
    setStarter(deck.draw(1)[0]);
    deck.uncut();
    dispatchNextPlay({ player: dealer + 1, nextAction: Action.PLAY });
  }

  function isValidPlay(index, claim, amount = sharedStack.length + 1) {
    const card = hands[nextPlayer][index];

    // can't play if it goes over 31
    if (stackTotal + card.rank.points > 31) return false;

    // if no claim (for points) then it's good
    if (!claim) return true;

    // can't claim if stack doesn't have enough cards
    if (sharedStack.length + 1 < amount) return false;

    const cards = [...sharedStack.slice(sharedStack.length - amount - 1), card];

    // now check claim
    return checkClaim(cards, claim);
  }

  function play(index) {
    dispatchStates({ type: "play", player: nextPlayer, index });
    dispatchNextPlay({ type: "next" });
  }

  function isValidGo() {
    return hands[nextPlayer].every(({ rank }) => stackTotal + rank.points > 31);
  }

  function go() {
    dispatchGoed({ type: "add", player: nextPlayer });
    dispatchNextPlay({ type: "next" });
  }

  // may check opponent's hand, so need player param (-1 for crib)
  /**
   * Checks if specified cards in specified hand/crib add up to 15,
   * form a run, are _-of-a-kind, or form a (valid) flush.
   *
   * @param {int} player Index of player, or -1 for crib.
   * @param {Array<int>} indices Indices of cards in hand/crib plus starter.
   * @param {string} claim "15", "run", "kind", or "flush"
   */
  function canScorePoints(player, indices, isUsingStarter, claim) {
    let isCrib = !hands[player];
    let amount = indices.length;

    let hand = hands[player] || crib;
    let cards = hand.filter((_, index) => indices.includes(index));
    if (isUsingStarter) cards.push(starter);

    // flush considerations

    // crib can only score a flush with all 5 cards
    if (isCrib && claim === "flush" && amount !== 5) return false;

    // 4-card flush cannot use starter
    if (claim === "flush" && amount === 4 && isUsingStarter) return false;

    // NOTE: TODO: avoid double-counting sub-kinds and sub-runs and sub-flushes

    return checkClaim(cards, claim);
  }

  function scoreHand() {
    if (nextPlayer === dealer) {
      dispatchNextPlay({ player: dealer, nextAction: Action.SCORE_CRIB });
    } else {
      dispatchNextPlay({ type: "next" });
    }
  }

  function scoreCrib() {
    dispatchNextPlay({ player: dealer + 1, nextAction: Action.RESET_ROUND });
  }

  function reset(cards) {
    let newDealer = (dealer + 1) % playerCount;
    setDealer(newDealer);
    dispatchStates({ type: "reset" });
    setStarter(null);
    deck.reset(cards);
    dispatchNextPlay({ player: newDealer, nextAction: Action.DEAL });
  }

  /**
   * Manually continue past an intermediary stage which only
   * exists so players can review the state before moving on.
   */
  function proceed() {
    switch (nextAction) {
      case Action.PROCEED_PLAY:
        // TODO: flip current piles face-down
        dispatchNextPlay({ player: nextPlayer, nextAction: Action.PLAY });
        break;

      case Action.PROCEED_SCORING:
        dispatchStates({ type: "re-hand" });
        dispatchNextPlay({ player: nextPlayer, nextAction: Action.SCORE_HAND });
        break;

      default:
        console.warn("proceed didn't match any nextAction", nextAction);
        break;
    }
  }

  //// Return ////

  return {
    starter,
    crib,
    hands,
    piles,
    deal,
    sendToCrib,
    cut,
    flip,
    isValidPlay,
    play,
    isValidGo,
    go,
    canScorePoints,
    scoreHand,
    scoreCrib,
    reset,
    proceed,
  };
}

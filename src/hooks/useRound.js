import { useEffect, useReducer, useState } from "react";

import Action from "./Action";

import { cardSorter, totalPoints } from "../playing-cards/cardHelpers.js";

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
  let playerCount = action.playerCount || states.hands.length;

  // if new game with new players, need to adjust player count
  if (action.type === "reset") return initialStates(playerCount);

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

    case "reset-shared-stack":
      newStates.sharedStack = [];
      break;

    default:
      console.error("reduceStates couldn't match action:", action);
      break;
  }
  return newStates;
}

function reduceGoed(goed, action) {
  let newGoed = [...goed];
  switch (action.type) {
    case "reset":
      newGoed = Array(action.playerCount).fill(false);
      break;

    case "add":
      newGoed[action.player] = true;
      break;

    default:
      console.error("reduceGoed couldn't match action:", action);
      break;
  }
  return newGoed;
}

////// Hook //////

export function useRound(deck, playerCount, dealer, previousPlayerAction) {
  //// States ////

  const [{ crib, hands, piles, sharedStack }, dispatchStates] = useReducer(
    reduceStates,
    playerCount,
    initialStates
  );

  const [starter, setStarter] = useState(null);

  // who played a card last in the play stage
  const [previousCardPlayedBy, setPreviousCardPlayedBy] = useState(null);

  // players who have goed since sharedStack last reset
  const [goed, dispatchGoed] = useReducer(
    reduceGoed,
    Array(playerCount).fill(false)
  );

  //// Helpers ////

  // add 1 modulo player count
  function next(player) {
    return (player + 1) % playerCount;
  }

  // next, but skipping players who are out
  function nextNotOut(player) {
    return !isOut[next(player)]
      ? next(player)
      : !isOut[next(next(player))]
      ? next(next(player))
      : // only possible in 3-player game; will cycle back on 3 nexts
        player;
  }

  //// Constants ////

  // previous player and action
  const {
    previousPlayer,
    previousAction,
    makePlayerArray,
    setPreviousPlayerAction,
  } = previousPlayerAction;

  const needsToDiscard = Array(playerCount)
    .fill(null)
    .map((_, player) => hands[player] && hands[player].length > 4);

  const stackTotal = totalPoints(sharedStack);

  // player is out in "play" phase if stack is maxed out, they have no cards, or they previously goed
  const isOut = Array(playerCount)
    .fill(null)
    .map(
      (_, player) =>
        stackTotal === 31 ||
        goed[player] ||
        (piles[player] && piles[player].length === 4)
    );

  const isCurrentPlayOver = [
    Action.FLIP_STARTER,
    Action.PLAY,
    Action.GO,
    Action.FLIP_PLAYED_CARDS,
  ].includes(previousAction)
    ? !isOut.includes(false)
    : null;

  const areAllHandsEmpty = hands.every((hand) => hand && hand.length === 0);

  // in the "play" phase
  const nextToPlayCard =
    previousAction === Action.FLIP_STARTER
      ? next(dealer)
      : previousAction === Action.FLIP_PLAYED_CARDS
      ? previousPlayer
      : [Action.PLAY, Action.GO].includes(previousAction)
      ? isCurrentPlayOver
        ? next(previousCardPlayedBy)
        : nextNotOut(previousPlayer)
      : null;

  // who to deal to next
  const nextToDealCardTo = [
    Action.START_DEALING,
    Action.CONTINUE_DEALING,
  ].includes(previousAction)
    ? playerCount === 2
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
      : 0
    : null;

  //// Next Action ////

  const [nextPlayers, nextAction] = (() => {
    switch (previousAction) {
      case Action.START_DEALING:
      case Action.CONTINUE_DEALING:
        return nextToDealCardTo !== null
          ? [makePlayerArray(dealer), Action.CONTINUE_DEALING]
          : [Array(playerCount).fill(true), Action.DISCARD];

      case Action.DISCARD:
        return needsToDiscard.includes(true)
          ? [needsToDiscard, Action.DISCARD]
          : [makePlayerArray(dealer - 1), Action.CUT_FOR_STARTER];

      case Action.CUT_FOR_STARTER:
        return [makePlayerArray(dealer), Action.FLIP_STARTER];

      case Action.FLIP_STARTER:
        return [makePlayerArray(nextToPlayCard), Action.PLAY_OR_GO];

      case Action.PLAY:
      case Action.GO:
        return [
          makePlayerArray(areAllHandsEmpty ? dealer : nextToPlayCard),
          isCurrentPlayOver
            ? areAllHandsEmpty
              ? Action.RETURN_CARDS_TO_HANDS
              : Action.FLIP_PLAYED_CARDS
            : Action.PLAY_OR_GO,
        ];

      case Action.FLIP_PLAYED_CARDS:
        return [makePlayerArray(nextToPlayCard), Action.PLAY_OR_GO];

      case Action.RETURN_CARDS_TO_HANDS:
        return [makePlayerArray(dealer + 1), Action.SCORE_HAND];

      case Action.SCORE_HAND:
        return previousPlayer === dealer
          ? [makePlayerArray(dealer), Action.SCORE_CRIB]
          : [makePlayerArray(previousPlayer + 1), Action.SCORE_HAND];

      case Action.SCORE_CRIB:
        // the round is over
        return [null, null];

      default: // action was taken outside of round's scope
        return [makePlayerArray(dealer), Action.START_DEALING];
    }
  })();

  const nextPlayer = nextPlayers ? nextPlayers.indexOf(true) : null;

  //// Effects ////

  // reset if player count changes
  useEffect(() => {
    dispatchStates({ type: "reset", playerCount });
    dispatchGoed({ type: "reset", playerCount });
  }, [playerCount]);

  // deal
  useEffect(() => {
    if (nextToDealCardTo === -1) {
      // deal to crib
      let card = deck.draw(1)[0];
      dispatchStates({ type: "deal-crib", card });
      setPreviousPlayerAction(nextPlayer, Action.CONTINUE_DEALING);
    } else if (nextToDealCardTo !== null) {
      // deal to next player
      let card = deck.draw(1)[0];
      dispatchStates({ type: "deal-player", player: nextToDealCardTo, card });
      setPreviousPlayerAction(nextPlayer, Action.CONTINUE_DEALING);
    }
  }, [nextToDealCardTo, nextPlayer, setPreviousPlayerAction, deck]);

  //// Checks ////

  function isValidGo() {
    const hand = hands[nextPlayer];
    return hand.every(({ rank }) => stackTotal + rank.points > 31);
  }

  function isValidPlay(index) {
    const card = hands[nextPlayer][index];
    return stackTotal + card.rank.points <= 31;
  }

  //// Actions ////

  function reset() {
    dispatchStates({ type: "reset", playerCount });
    setStarter(null);
    dispatchGoed({ type: "reset", playerCount });
    setPreviousCardPlayedBy(null);
  }

  // dealing is done via side-effect, to allow to delays/animations/etc in the future
  function deal() {
    setPreviousPlayerAction(nextPlayer, Action.START_DEALING);
  }

  function discardToCrib(player, indices) {
    // move cards in desc order so indices don't get changed as we go
    const descIndices = indices.sort().reverse();
    for (let index of descIndices) {
      dispatchStates({ type: "discard", player, index });
    }
    setPreviousPlayerAction(player, Action.DISCARD);
  }

  function cut() {
    deck.cut(4);
    setPreviousPlayerAction(nextPlayer, Action.CUT_FOR_STARTER);
  }

  function flip() {
    let card = deck.draw(1)[0];
    setStarter(card);
    deck.uncut();
    setPreviousPlayerAction(nextPlayer, Action.FLIP_STARTER);
  }

  function play(index) {
    let card = hands[nextPlayer][index];
    setPreviousCardPlayedBy(nextPlayer);
    dispatchStates({ type: "play", player: nextPlayer, index });
    setPreviousPlayerAction(nextPlayer, Action.PLAY);
  }

  function go() {
    dispatchGoed({ type: "add", player: nextPlayer });
    setPreviousPlayerAction(nextPlayer, Action.GO);
  }

  function endPlay() {
    setPreviousCardPlayedBy(null);
    dispatchStates({ type: "reset-shared-stack" });
    dispatchGoed({ type: "reset" });
    setPreviousPlayerAction(nextPlayer, Action.FLIP_PLAYED_CARDS);
  }

  function returnToHand() {
    setPreviousCardPlayedBy(null);
    dispatchStates({ type: "re-hand" });
    dispatchGoed({ type: "reset" });
    setPreviousPlayerAction(nextPlayer, Action.RETURN_CARDS_TO_HANDS);
  }

  function scoreHand() {
    setPreviousPlayerAction(nextPlayer, Action.SCORE_HAND);
  }

  function scoreCrib() {
    setPreviousPlayerAction(nextPlayer, Action.SCORE_CRIB);
  }

  //// Return ////

  return {
    // UI data
    starter,
    crib,
    hands,
    piles,
    sharedStack,

    // logic data
    nextPlayers,
    nextAction,
    isCurrentPlayOver,

    // checks
    isValidGo,
    isValidPlay,

    // actions
    reset,
    deal,
    discardToCrib,
    cut,
    flip,
    play,
    go,
    endPlay,
    returnToHand,
    scoreHand,
    scoreCrib,
  };
}

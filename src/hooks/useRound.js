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

export function useRound(deck, playerCount, dealer) {
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

  const [{ previousPlayer, previousAction }, setPreviousPlayerAction] =
    useState({ previousPlayer: null, previousAction: null });

  //// Helpers ////

  // add 1 modulo player count
  function next(player) {
    return (player + 1) % playerCount;
  }

  function makePlayerArray(player) {
    let arr = Array(playerCount).fill(false);
    // player might be negative
    arr[(player + playerCount) % playerCount] = true;
    return arr;
  }

  function setPreviousAction(previousAction) {
    setPreviousPlayerAction({ previousPlayer: nextPlayer, previousAction });
  }

  const needsToDiscard = Array(playerCount)
    .fill(null)
    .map((_, player) => hands[player] && hands[player].length > 4);

  const stackTotal = totalPoints(sharedStack);

  // player is out in "play" phase if stack is maxed out, they have no cards, or they previously goed
  const isOut = Array(playerCount)
    .fill(null)
    .map(
      (_, player) =>
        nextAction === Action.PLAY_OR_GO &&
        (stackTotal === 31 || goed[player] || hands[player].length === 0)
    );

  const areAllOut = !isOut.includes(false);

  const areAllHandsEmpty = hands.every((hand) => hand && hand.length === 0);

  // in the "play" phase
  const nextToPlayCard = areAllOut
    ? next(previousCardPlayedBy)
    : !isOut[next(previousCardPlayedBy)]
    ? next(previousCardPlayedBy)
    : !isOut[next(next(previousCardPlayedBy))]
    ? next(next(previousCardPlayedBy))
    : previousCardPlayedBy;

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
      case null:
        return [dealer, Action.START_DEALING];

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
        return [makePlayerArray(dealer + 1), Action.PLAY_OR_GO];

      case Action.PLAY:
      case Action.GO:
        return [
          makePlayerArray(nextToPlayCard),
          areAllOut
            ? areAllHandsEmpty
              ? Action.RETURN_CARDS_TO_HANDS
              : Action.FLIP_PLAYED_CARDS
            : Action.PLAY_OR_GO,
        ];

      case Action.FLIP_PLAYED_CARDS:
        return [makePlayerArray(previousCardPlayedBy + 1), Action.PLAY_OR_GO];

      case Action.RETURN_CARDS_TO_HANDS:
        return [makePlayerArray(dealer + 1), Action.SCORE_HAND];

      case Action.SCORE_HAND:
        return previousPlayer === dealer
          ? [makePlayerArray(dealer), Action.SCORE_CRIB]
          : [makePlayerArray(previousPlayer + 1), Action.SCORE_HAND];

      case Action.START_NEW_ROUND:
        return [null, null];

      default:
        console.error("Couldn't recognize previous action", previousAction);
        return [null, null];
    }
  })();

  const nextPlayer = nextPlayers.indexOf(true);

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
    } else if (nextToDealCardTo !== null) {
      // deal to next player
      let card = deck.draw(1)[0];
      dispatchStates({ type: "deal-player", player: nextToDealCardTo, card });
    }
  }, [nextToDealCardTo, deck]);

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
    setPreviousPlayerAction({ previousAction: null, previousPlayer: null });
  }

  // dealing is done via side-effect, to allow to delays/animations/etc in the future
  function deal() {
    setPreviousAction(Action.START_DEALING);
  }

  function discardToCrib(player, indices) {
    // move cards in desc order so indices don't get changed as we go
    const descIndices = indices.sort().reverse();
    for (let index of descIndices) {
      dispatchStates({ type: "discard", player, index });
    }
    setPreviousPlayerAction({
      previousPlayer: player,
      previousAction: Action.DISCARD,
    });
  }

  function cut() {
    deck.cut(4);
    setPreviousAction(Action.CUT_FOR_STARTER);
  }

  function flip() {
    setStarter(deck.draw(1)[0]);
    deck.uncut();
    setPreviousAction(Action.FLIP_STARTER);
  }

  function play(index) {
    setPreviousCardPlayedBy(nextPlayer);
    dispatchStates({ type: "play", player: nextPlayer, index });
    setPreviousAction(Action.PLAY);
  }

  function go() {
    dispatchGoed({ type: "add", player: nextPlayer });
    setPreviousAction(Action.GO);
  }

  function endPlay() {
    setPreviousCardPlayedBy(null);
    dispatchStates({ type: "reset-shared-stack" });
    setPreviousAction(Action.FLIP_PLAYED_CARDS);
  }

  function returnToHand() {
    setPreviousCardPlayedBy(null);
    dispatchStates({ type: "re-hand" });
    setPreviousAction(Action.RETURN_CARDS_TO_HANDS);
  }

  function scoreHand() {
    setPreviousAction(Action.SCORE_HAND);
  }

  function scoreCrib() {
    setPreviousAction(Action.SCORE_CRIB);
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
    previousPlayer,
    previousAction,
    nextPlayers,
    nextAction,
    previousCardPlayedBy,
    areAllOut,

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

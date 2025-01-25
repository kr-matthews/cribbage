import { useEffect, useReducer } from "react";

import _ from "lodash";
import Action from "./Action";
import { flipCard } from "../playing-cards/cardHelpers";

//// Reducers ////

function reduceCuts(cuts, action) {
  let newCuts = [...cuts];
  switch (action.type) {
    case "reset":
      newCuts = Array(action.playerCount).fill(null);
      break;

    case "add":
      flipCard(action.card, true);
      newCuts[action.player] = action.card;
      break;

    default:
      console.error("reduceCuts couldn't match action", action);
      break;
  }

  return newCuts;
}

////// Hook //////

export function useCutForDeal(deck, playerCount, previousPlayerAction) {
  //// States ////

  const [cuts, dispatchCuts] = useReducer(reduceCuts, [null]);
  const rankIndices = cuts.map((card) => card && card.rank.index);

  /** Index if there's a winner, -1 if there's a draw, null if incomplete */
  const firstDealer =
    cuts[playerCount - 1] !== null
      ? _.uniq([...rankIndices].sort((a, b) => a - b).slice(0, 2)).length === 2
        ? rankIndices.indexOf(Math.min(...rankIndices))
        : -1
      : null;

  // previous player and action
  const { previousPlayer, makePlayerArray, setPreviousPlayerAction } =
    previousPlayerAction;

  //// Effects ////

  // when players join or leave pre-game, reset
  useEffect(() => {
    dispatchCuts({ type: "reset", playerCount });
  }, [playerCount]);

  //// Next Action ////

  const [nextPlayers, nextAction] = (() => {
    if (firstDealer === -1) {
      // everyone cut but no unique lowest card
      return [makePlayerArray(0), Action.SET_UP_CUT_FOR_DEAL_RETRY];
    } else if (firstDealer !== null) {
      // everyone cut and a dealer has been determined
      return [makePlayerArray(firstDealer), Action.START_FIRST_GAME];
    } else if (cuts[0] === null) {
      // nobody has cut
      return [makePlayerArray(0), Action.CUT_FOR_DEAL];
    } else {
      // some but not all have cut
      return [makePlayerArray(previousPlayer + 1), Action.CUT_FOR_DEAL];
    }
  })();

  const nextPlayer = nextPlayers ? nextPlayers.indexOf(true) : null;

  //// Actions ////

  function cut() {
    if (cuts[playerCount - 1] !== null) return;
    // leave at least half the (remaining uncut) deck; take at least 4
    deck.cut(Math.floor(deck.unCutCount / 2), 4);
    let card = deck.draw(1)[0];
    dispatchCuts({ type: "add", player: cuts.indexOf(null), card });
    setPreviousPlayerAction(nextPlayer, Action.CUT_FOR_DEAL);
  }

  function reset() {
    dispatchCuts({ type: "reset", playerCount });
  }

  //// Return ////

  return { cuts, firstDealer, nextPlayers, nextAction, cut, reset };
}

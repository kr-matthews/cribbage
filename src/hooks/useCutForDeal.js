import { useEffect, useReducer } from "react";

import _ from "lodash";

import Action from "./Action";

//// Reducers ////

function reduceCuts(cuts, action) {
  let newCuts = [...cuts];
  switch (action.type) {
    case "reset":
      newCuts = Array(action.playerCount).fill(null);
      break;

    case "add":
      newCuts[action.player] = action.card;
      break;

    default:
      console.error("reduceCuts couldn't match action", action);
      break;
  }

  return newCuts;
}

////// Hook //////

export function useCutForDeal(deck, playerCount, setDealer, dispatchNextPlay) {
  //// States ////

  const [cuts, dispatchCuts] = useReducer(reduceCuts, [null]);
  const rankIndices = cuts.map((card) => card && card.rank.index);
  // everyone has cut and there's no tie for first (lowest card rank)
  const firstDealer =
    cuts[playerCount - 1] !== null &&
    _.uniq([...rankIndices].sort().slice(0, 2)).length === 2
      ? rankIndices.indexOf(Math.min(...rankIndices))
      : null;

  //// Effects ////

  // when players join or leave pre-game, reset
  useEffect(() => {
    dispatchCuts({ type: "reset", playerCount });
  }, [playerCount]);

  // after a cut, assign the dealer if possible
  useEffect(() => {
    if (firstDealer !== null) {
      // dealer identified
      setDealer(firstDealer);
      dispatchNextPlay({ player: firstDealer, action: Action.PROCEED_DEAL });
    } else if (!cuts.includes(null)) {
      // tie for lowest card
      dispatchNextPlay({ player: 0, action: Action.RETRY_CUT_FOR_DEAL });
    }
  }, [cuts, firstDealer, setDealer, dispatchNextPlay]);

  //// Functions ////

  function cut() {
    if (cuts[playerCount - 1] !== null) return;
    // leave at least half the (remaning uncut) deck; take at least 4
    deck.cut(Math.floor(deck.unCutCount / 2), 4);
    let card = deck.draw(1)[0];
    dispatchCuts({ type: "add", player: cuts.indexOf(null), card });
    dispatchNextPlay({ type: "next" });
  }

  function reset(cards) {
    deck.reset(cards);
    reduceCuts({ type: "reset" });
  }

  //// Return ////

  return { cuts, firstDealer, cut, reset };
}

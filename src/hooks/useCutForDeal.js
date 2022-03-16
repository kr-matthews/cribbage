import { useEffect, useReducer } from "react";

import _ from "lodash";

//// Reducers ////

function reduceCuts(cuts, action) {
  let newCuts = [...cuts];
  switch (action.type) {
    case "reset":
      newCuts = [null, null, null].slice(0, action.playerCount);
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

export default function useCutForDeal(deck, playerCount) {
  //// States ////

  const [cuts, dispatchCuts] = useReducer(reduceCuts, [null]);
  const rankIndices = cuts.map((card) => card && card.rank.index);
  const firstDealer =
    _.uniq(rankIndices).length < playerCount
      ? null
      : rankIndices.indexOf(Math.min(rankIndices));
  //// Effects ////

  useEffect(() => {
    dispatchCuts({ type: "reset", playerCount });
  }, [playerCount]);

  //// Functions ////

  function cut(player) {
    // leave at least half the (remaning uncut) deck; take at least 4
    deck.cut(Math.floor(deck.unCutCount / 2), 4);
    let card = deck.draw(1)[0];
    dispatchCuts({ type: "add", player, card });
  }

  function reset() {
    reduceCuts({ type: "reset" });
  }

  //// Return ////

  return { cuts, firstDealer, cut, reset };
}
// TODO: NEXT: NEXT: NEXT: move cut for deal logic here, then commit to finish fixing the initial logic

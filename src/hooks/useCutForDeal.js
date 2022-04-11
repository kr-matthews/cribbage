import { useEffect, useReducer } from "react";

import _ from "lodash";

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

export function useCutForDeal(deck, playerCount) {
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

  //// Effects ////

  // when players join or leave pre-game, reset
  useEffect(() => {
    dispatchCuts({ type: "reset", playerCount });
  }, [playerCount]);

  //// Functions ////

  function cut() {
    if (cuts[playerCount - 1] !== null) return;
    // leave at least half the (remaning uncut) deck; take at least 4
    deck.cut(Math.floor(deck.unCutCount / 2), 4);
    let card = deck.draw(1)[0];
    dispatchCuts({ type: "add", player: cuts.indexOf(null), card });
  }

  function reset(cards) {
    deck.reset(cards);
    dispatchCuts({ type: "reset", playerCount });
  }

  //// Return ////

  return { cuts, firstDealer, cut, reset };
}

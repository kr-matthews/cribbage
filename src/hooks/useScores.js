import { useReducer, useEffect } from "react";
import Rank from "../playing-cards/Rank";

//// Helpers ////

function initialScores(playerCount) {
  return {
    current: [0, 0, 0].slice(0, playerCount), // current (1st peg)
    previous: [-1, -1, -1].slice(0, playerCount), // previous (2nd peg)
  };
}

//// Reducers ////

function scoresReducer(
  { current, previous },
  { type, player, points, playerCount }
) {
  if (type === "reset") return initialScores(playerCount);

  let newPrevious = [...previous];
  let newCurrent = [...current];
  switch (type) {
    case "increment":
      newPrevious[player] = current[player];
      newCurrent[player] += points;
      break;

    default:
      console.error("scoresReducer couldn't recognize action type", type);
  }
  return { current: newCurrent, previous: newPrevious };
}

//// Hook ////

export function useScores(
  playerCount,
  previousPlayer,
  dealer,
  areAllInactive,
  starter,
  stackTotal
) {
  //// Constants and States

  // the most recent two scores for each player (correspond to peg positions)
  const [{ current, previous }, dispatchScores] = useReducer(
    scoresReducer,
    playerCount,
    initialScores
  );

  const hasWinner = current.some((score) => score > 120);
  const winner =
    current[0] > 120 ? 0 : current[1] > 120 ? 1 : current[2] > 120 ? 2 : null;

  //// Helpers ////

  //

  //// Effects ////

  // reset if player count changes
  useEffect(() => {
    dispatchScores({ type: "reset", playerCount });
  }, [playerCount]);

  // score cutting a jack
  useEffect(() => {
    if (starter && starter.rank === Rank.JACK) {
      peg(dealer, 2);
    }
  }, [dealer, starter]);

  // score play to 31
  useEffect(() => {
    if (stackTotal === 31) {
      peg(previousPlayer, 2);
    }
  }, [previousPlayer, stackTotal]);

  // score last to play (not 31)
  useEffect(() => {
    if (areAllInactive && 0 < stackTotal && stackTotal < 31) {
      console.debug(previousPlayer, "ended"); // TEMP
      peg(previousPlayer, 1);
    }
  }, [areAllInactive, previousPlayer, stackTotal]);

  //// Return Functions ////

  function peg(player, points) {
    dispatchScores({ type: "increment", player, points });
  }

  function reset() {
    dispatchScores({ type: "reset", playerCount });
  }

  //// Return ////

  // TODO: NEXT: NEXT: build out scores hook
  return {
    current,
    previous,
    peg,
    hasWinner,
    winner,
    reset,
  };
}

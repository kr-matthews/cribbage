import { useEffect, useReducer } from "react";

//// Constants ////

const NORMAL_WIN_POINTS = 1;
const SKUNK_POINTS = 2;
const DOUBLE_SKUNK_POINTS = 4;
const TRIPLE_SKUNK_POINTS = 7;

//// Helpers ////

function initialGamePoints(playerCount) {
  return Array(playerCount).fill(0);
}

//// Reducers ////

function gamePointsReducer(
  gamePoints,
  {
    type,
    player,
    playerCount,
    nonSkunkCount,
    skunkCount,
    doubleSkunkCount,
    tripleSkunkCount,
  }
) {
  if (type === "reset") return initialGamePoints(playerCount);

  let newGamePoints = [...gamePoints];
  switch (type) {
    case "win":
      newGamePoints[player] +=
        NORMAL_WIN_POINTS * nonSkunkCount +
        SKUNK_POINTS * skunkCount +
        DOUBLE_SKUNK_POINTS * doubleSkunkCount +
        TRIPLE_SKUNK_POINTS * tripleSkunkCount;
      break;

    default:
      console.error("gamePointsReducer couldn't recognize action type", type);
      break;
  }
  return newGamePoints;
}

export function useGamePoints(
  playerCount,
  winner,
  nonSkunkCount,
  skunkCount,
  doubleSkunkCount,
  tripleSkunkCount
) {
  //// Constants & State ////

  const [gamePoints, dispatchGamePoints] = useReducer(
    gamePointsReducer,
    playerCount,
    initialGamePoints
  );

  //// Effects ////

  // reset on playerCount change
  useEffect(() => {
    dispatchGamePoints({ type: "reset", playerCount });
  }, [playerCount]);

  // when someone wins, increase their game points:
  // - a point for each player beaten
  // - another point for each skunk
  // - another 2 points for each double-skunk
  useEffect(() => {
    if (winner !== -1) {
      console.debug(
        winner,
        nonSkunkCount,
        skunkCount,
        doubleSkunkCount,
        tripleSkunkCount,
        playerCount
      ); // TEMP
      dispatchGamePoints({
        type: "win",
        player: winner,
        nonSkunkCount,
        skunkCount,
        doubleSkunkCount,
        tripleSkunkCount,
      });
    }
  }, [
    winner,
    nonSkunkCount,
    skunkCount,
    doubleSkunkCount,
    tripleSkunkCount,
    playerCount,
  ]);

  //// Functions ////

  function reset() {
    dispatchGamePoints({ type: "reset", playerCount });
  }

  //// Return ////

  return { points: gamePoints, reset };
}

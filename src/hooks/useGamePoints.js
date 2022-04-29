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
    playerCount,
    pointsToWin,
    player,
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
      // don't go past winning amount
      newGamePoints[player] = Math.min(
        pointsToWin,
        newGamePoints[player] +
          NORMAL_WIN_POINTS * nonSkunkCount +
          SKUNK_POINTS * skunkCount +
          DOUBLE_SKUNK_POINTS * doubleSkunkCount +
          TRIPLE_SKUNK_POINTS * tripleSkunkCount
      );
      break;

    default:
      console.error("gamePointsReducer couldn't recognize action type", type);
      break;
  }
  return newGamePoints;
}

export function useGamePoints(
  playerCount,
  gameWinner,
  nonSkunkCount,
  skunkCount,
  doubleSkunkCount,
  tripleSkunkCount,
  pointsToWin
) {
  //// Constants & State ////

  // if not specified, use these defaults
  pointsToWin ||= playerCount === 2 ? 5 : 7;

  const [gamePoints, dispatchGamePoints] = useReducer(
    gamePointsReducer,
    playerCount,
    initialGamePoints
  );

  const matchWinner = gamePoints.findIndex((points) => points >= pointsToWin);
  const hasMatchWinner = matchWinner !== -1;

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
    if (gameWinner !== -1) {
      dispatchGamePoints({
        type: "win",
        pointsToWin,
        player: gameWinner,
        nonSkunkCount,
        skunkCount,
        doubleSkunkCount,
        tripleSkunkCount,
      });
    }
  }, [
    playerCount,
    pointsToWin,
    gameWinner,
    nonSkunkCount,
    skunkCount,
    doubleSkunkCount,
    tripleSkunkCount,
  ]);

  //// Functions ////

  function reset() {
    dispatchGamePoints({ type: "reset", playerCount });
  }

  //// Return ////

  return { points: gamePoints, hasMatchWinner, matchWinner, reset };
}

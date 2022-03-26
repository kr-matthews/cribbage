import { useReducer, useEffect } from "react";
import { checkClaim, totalPoints } from "../playing-cards/cardHelpers";
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
      if (points <= 0) break; // don't move the 2nd peg if "pegging" 0
      newPrevious[player] = current[player];
      newCurrent[player] += points;
      break;

    default:
      console.error("scoresReducer couldn't recognize action type", type);
  }
  return { current: newCurrent, previous: newPrevious };
}

//// Hook ////

// TODO: NEXT: NEXT: build out scores hook

export function useScores(
  playerCount,
  dealer,
  previousPlayer,
  areAllInactive,
  starter,
  sharedStack,
  claims
) {
  //// Constants and States ////

  const stackTotal = totalPoints(sharedStack);

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

  // peg 2 for cutting a jack
  useEffect(() => {
    if (starter && starter.rank === Rank.JACK) {
      peg(dealer, 2);
    }
  }, [dealer, starter]);

  // peg after last play
  //  combine into one big effect so that all points are in a single pegging
  useEffect(() => {
    if (stackTotal > 0) {
      let cardAmount;
      let points = 0;

      // got 15?
      if (claims[15] && checkClaim(sharedStack, "15")) {
        points += 2;
      }

      // got _-of-a-kind?
      if (claims["kind"]) {
        cardAmount =
          claims["kind"] === "any" ? sharedStack.length : claims["kind"];
        points +=
          checkClaim(
            sharedStack.slice(sharedStack.length - cardAmount),
            "kind",
            claims["kind"] === "any"
          ) || 0;
      }

      // got a run?
      if (claims["run"]) {
        cardAmount =
          claims["run"] === "any" ? sharedStack.length : claims["run"];
        points +=
          checkClaim(
            sharedStack.slice(sharedStack.length - cardAmount),
            "run",
            claims["run"] === "any"
          ) || 0;
      }

      // end of play?
      if (areAllInactive) {
        points += stackTotal === 31 ? 2 : 1;
      }

      console.debug(
        "Scoring",
        points,
        "for",
        previousPlayer,
        "(",
        stackTotal,
        ")"
      ); // TEMP
      // peg all points at once
      peg(previousPlayer, points);
    }
  }, [areAllInactive, previousPlayer, sharedStack, stackTotal]);

  //// Return Functions ////

  function peg(player, points) {
    dispatchScores({ type: "increment", player, points });
  }

  function reset() {
    dispatchScores({ type: "reset", playerCount });
  }

  //// Return ////

  return {
    current,
    previous,
    peg,
    hasWinner,
    winner,
    reset,
  };
}

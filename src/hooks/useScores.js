import { useReducer, useEffect } from "react";
import {
  checkClaim,
  longestSuchClaim,
  totalPoints,
} from "../playing-cards/cardHelpers";
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
  justPlayed,
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

  // peg after **playing a card**
  //  combine into one big effect so that all points are in a single pegging
  useEffect(() => {
    if (justPlayed && stackTotal > 0) {
      let points = 0;

      // got 15?
      if (claims[15] && checkClaim(sharedStack, "15")) {
        points += 2;
      }

      // got _-of-a-kind?
      switch (claims["kind"]) {
        case "any":
          points += longestSuchClaim(sharedStack, "kind");
          break;

        case 2:
          if (
            sharedStack.length >= 2 &&
            checkClaim(sharedStack.slice(sharedStack.length - 2), "kind")
          ) {
            points += 2;
          }
          break;

        case 3:
          if (
            sharedStack.length >= 3 &&
            checkClaim(sharedStack.slice(sharedStack.length - 3), "kind")
          ) {
            points += 6;
          }
          break;

        case 4:
          if (
            sharedStack.length >= 4 &&
            checkClaim(sharedStack.slice(sharedStack.length - 4), "kind")
          ) {
            points += 12;
          }
          break;

        default:
          break;
      }

      // got a run?
      if (claims["run"] === "any") {
        points += longestSuchClaim(sharedStack, "run");
      } else if (
        claims["run"] &&
        checkClaim(sharedStack.slice(sharedStack.length - claims["run"]), "run")
      ) {
        points += claims["run"];
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
  }, [areAllInactive, previousPlayer, justPlayed, sharedStack, stackTotal]);

  // peg after ending play via **explicit go**
  useEffect(() => {
    if (areAllInactive && !justPlayed) {
      peg(previousPlayer, 1);
    }
  }, [areAllInactive, justPlayed]);

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

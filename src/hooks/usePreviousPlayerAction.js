import { useCallback, useState } from "react";

export function usePreviousPlayerAction(playerCount) {
  //// States ////

  const [{ previousPlayer, previousAction }, setPrevious] = useState({
    previousPlayer: null,
    previousAction: null,
  });

  //// Helpers ////

  function makePlayerArray(player) {
    let arr = Array(playerCount).fill(false);
    // player might be negative
    arr[(player + playerCount) % playerCount] = true;
    return arr;
  }

  const setPreviousPlayerAction = useCallback(
    (player, action) =>
      setPrevious({
        previousPlayer: player,
        previousAction: action,
      }),
    [setPrevious]
  );

  //// Return ////

  return {
    previousPlayer,
    previousAction,

    makePlayerArray,

    setPreviousPlayerAction,
  };
}

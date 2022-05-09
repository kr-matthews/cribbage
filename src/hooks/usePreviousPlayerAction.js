import { useCallback, useState } from "react";

export function usePreviousPlayerAction(playerCount) {
  //// States ////

  const [{ previousPlayer, previousAction, data }, setPrevious] = useState({
    previousPlayer: null,
    previousAction: null,
    data: {},
  });

  //// Helpers ////

  function makePlayerArray(player) {
    let arr = Array(playerCount).fill(false);
    // player might be negative
    arr[(player + playerCount) % playerCount] = true;
    return arr;
  }

  const setPreviousPlayerAction = useCallback(
    (player, action, data) =>
      setPrevious({
        previousPlayer: player,
        previousAction: action,
        data,
      }),
    [setPrevious]
  );

  //// Return ////

  return {
    previousPlayer,
    previousAction,
    data,

    makePlayerArray,

    setPreviousPlayerAction,
  };
}

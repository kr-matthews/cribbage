import { useEffect, useReducer, useState } from "react";

//// Constants

const INITIAL_STATES = {
  crib: [],
  hands: [[], [], []],
  piles: [[], [], []],
  sharedStack: [],
};

//// Reducers

function reduceStates(states, action) {
  let newStates = [...states];
  switch (action.type) {
    case "reset":
      newStates = INITIAL_STATES;
      break;

    case "deal-player":
      newStates.hands[action.player].push(action.card);
      break;

    case "deal-crib":
      newStates.crib.push(action.card);
      break;

    case "discard":
      newStates.crib.push(states.hands[action.player].splice(action.index, 1));
      break;

    case "play":
      newStates.piles[action.player].push(
        newStates.hands[action.player].splice(action.index, 1)
      );
      break;

    case "re-hand":
      // TODO: return cards from piles to hands (and sort)
      break;

    case "all-goed":
      // TODO: reset sharedStack and flip piles
      break;

    default:
      console.error("reduceStates couldn't match action:", action);
      break;
  }
  return newStates;
}

function reduceNextPlay(nextPlay, action) {
  let newNextPlay = { ...nextPlay };
  switch (action.type) {
    case "add":
      newNextPlay.toPlay.add(action.player);
      break;

    case "remove":
      newNextPlay.toPlay.delete(action.player);
      break;

    case "all":
      for (let player = 0; player < action.playerCount; player++) {
        newNextPlay.toPlay.add(player);
      }
      newNextPlay.stage = action.stage;
      break;

    case "next":
      if (nextPlay.size === 1) {
        newNextPlay = new Set([
          newNextPlay.toPlay.values().next().value % action.playerCount,
        ]);
      }
      action.stage && (newNextPlay.stage = action.stage);
      break;

    case "set":
      action.player &&
        (newNextPlay.toPlay = new Set([action.player % action.playerCount]));
      action.stage && (newNextPlay.stage = action.stage);
      break;

    default:
      console.error("reduceToPlay couldn't match action:", action);
      break;
  }
  return newNextPlay;
}

function reduceGoed(goed, action) {
  let newGoed = new Set(...goed);
  switch (action.type) {
    case "reset":
      newGoed = new Set();
      break;

    case "add":
      newGoed.add(action.player);
      break;

    default:
      console.error("reduceGoed couldn't match action:", action);
      break;
  }
}

//// Hook

export function useRound(playerCount, dealer, deck) {
  //// States and Constants

  const [{ crib, hands, piles, sharedStack }, dispatchStates] = useReducer(
    reduceStates,
    INITIAL_STATES
  );

  const stackTotal = sharedStack.reduce(
    (partialSum, { rank }) => partialSum + rank.points,
    0
  );

  const [starter, setStarter] = useState(null);

  const [{ toPlay, stage }, dispatchNextPlay] = useReducer(reduceNextPlay, {
    toPlay: new Set([dealer]),
    stage: "deal",
  });

  // players who have goed since sharedStack last reset
  const [goed, dispatchGoed] = useReducer(reduceGoed, new Set());

  //// Helpers - Getters

  // use to get the unique player to play next when applicable
  function getToPlay() {
    return toPlay.values().next.value;
  }

  //// Helpers - Actions

  function incrementNextPlay(stage) {
    dispatchNextPlay({ type: "next", playerCount, stage });
  }

  function setNextPlay(player, stage) {
    dispatchNextPlay({ type: "set", player, playerCount, stage });
  }

  function allToPlay(stage) {
    dispatchNextPlay({ type: "all", playerCount, stage });
  }

  //// Effects

  // once everyone has submitted to the crib
  useEffect(() => {
    if (crib.length === 4) {
      setNextPlay(dealer + 1, "cut");
    }
  }, [crib.length]);

  // skip players out of cards in play stage, if stage not over
  useEffect(() => {
    if (
      stage === "play" &&
      hands[getToPlay()].length === 0 &&
      hands[0].length + hands[1].length + hands[2].length > 0
    ) {
      incrementNextPlay();
    }
  }, [stage, hands, getToPlay()]);
  // hands itself won't change as it's a pointer

  // once everyone has goed, reset sharedStack, if stage not over
  useEffect(() => {
    if (stage === "play" && goed.size === playerCount) {
      dispatchGoed({ type: "reset" });
      dispatchStates({ type: "all-goed" });
    }
  }, [stage, playerCount, goed.size]);

  // once all cards have been played in play stage
  useEffect(() => {
    if (
      stage === "play" &&
      hands[0].length + hands[1].length + hands[2].length === 0
    ) {
      dispatchStates({ type: "re-hand" });
      setNextPlay(dealer + 1, "score");
    }
  }, [stage, hands[0].length + hands[1].length + hands[2].length]);
  // hands itself won't change as it's a pointer

  //// Functions

  function deal(playerCount) {
    const amountToDeal = playerCount === 2 ? 6 : 5;

    for (let index = 0; index < amountToDeal; index++) {
      for (let player = 0; player < playerCount; player++) {
        let card = deck.draw();
        dispatchStates({ type: "deal-player", player, card });
      }
    }

    if (playerCount === 3) {
      let card = deck.draw();
      dispatchStates({ type: "deal-crib", card });
    }

    allToPlay("discard");
  }

  function sendToCrib(player, indices) {
    // move cards in desc order so indices don't get changed mid-move
    const descIndices = indices.sort().reverse();
    for (let index of descIndices) {
      dispatchStates({ type: "discard", player, index });
    }

    dispatchNextPlay({ type: "remove", player });
  }

  function cut() {
    deck.cut();
    incrementNextPlay("flip");
  }

  function flip() {
    setStarter(deck.draw());
    deck.uncut();
    setNextPlay(dealer + 1, "play");
  }

  function isValidPlay(index, claim) {
    return stackTotal + hands[getToPlay()][index].rank.points <= 31;
    // TODO: ... and check claim is valid
  }

  function play(index) {
    dispatchStates({ type: "play", player: getToPlay(), index });
    incrementNextPlay();
  }

  function isValidGo() {
    hands[getToPlay].every(({ rank }) => stackTotal + rank.points > 31);
  }

  function go() {
    dispatchGoed({ type: "add", player: getToPlay() });
    incrementNextPlay();
  }

  // may check opponent's hand, so need player param (-1 for crib)
  function canScorePoints(player, indices, claim) {
    let hand = player === -1 ? crib : hands[player];
    // TODO: check claim is valid
  }

  function scoreHand() {
    if (toPlay === dealer) {
      setNextPlay(dealer, "crib");
    } else {
      incrementNextPlay();
    }
  }

  function scoreCrib() {
    setNextPlay(dealer + 1, "done"); // TODO: confirm dealer + 1
  }

  function reset(cards) {
    dispatchStates({ type: "reset" });
    setStarter(null);
    deck.reset(cards);
    setNextPlay(dealer, "deal");
  }

  //// Return

  return {
    starter,
    crib,
    hands,
    piles,
    toPlay,
    stage,
    deal,
    sendToCrib,
    cut,
    flip,
    isValidPlay,
    play,
    isValidGo,
    go,
    canScorePoints,
    scoreHand,
    scoreCrib,
    reset,
  };
}

// TODO: NEXT: continue useRound

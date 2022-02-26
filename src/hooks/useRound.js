import { useEffect, useReducer, useState } from "react";

//// Constants

const INITIAL_STATES = {
  crib: [],
  hands: [[], [], []],
  piles: [[], [], []],
  sharedStack: [],
};

//// Helpers

function cardSorter(card1, card2) {
  return (
    card1.rank.index - card2.rank.index || card1.suit.index - card2.suit.index
  );
}

//// Reducers

function reduceStates(states, action) {
  // want to create new state, not alter existing state, so make copies of all changing pieces
  let newStates = {
    crib: [...states.crib],
    hands: [[...states.hands[0]], [...states.hands[1]], [...states.hands[2]]],
    piles: [[...states.piles[0]], [...states.piles[1]], [...states.piles[2]]],
    sharedStack: [...states.sharedStack],
  };
  switch (action.type) {
    case "reset":
      newStates = INITIAL_STATES;
      break;

    case "deal-player":
      newStates.hands[action.player].push(action.card);
      newStates.hands[action.player].sort(cardSorter);
      break;

    case "deal-crib":
      newStates.crib.push(action.card);
      break;

    case "discard":
      let card = newStates.hands[action.player].splice(action.index, 1)[0];
      newStates.crib.push(card);
      newStates.crib.sort(cardSorter);
      break;

    case "play":
      newStates.piles[action.player].push(
        newStates.hands[action.player].splice(action.index, 1)[0]
      );
      break;

    case "re-hand":
      newStates.hands = newStates.piles;
      newStates.hands.forEach((hand) => hand.sort(cardSorter));
      newStates.piles = [[], [], []];
      newStates.sharedStack = [];
      break;

    case "all-goed":
      newStates.sharedStack = [];
      break;

    default:
      console.error("reduceStates couldn't match action:", action);
      break;
  }
  return newStates;
}

function reduceNextPlay(nextPlay, action) {
  let newNextPlay = {
    toPlay: new Set(nextPlay.toPlay),
    stage: nextPlay.stage,
  };
  switch (action.type) {
    case "add": // unused
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
      if (newNextPlay.toPlay.size === 1) {
        newNextPlay.toPlay = new Set([
          ([...newNextPlay.toPlay][0] + 1) % action.playerCount,
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

// TODO: NEXT: fix goed (set might be wrong, and might not be skiping goeds at all)
function reduceGoed(goed, action) {
  console.debug("before", goed.size); // TEMP
  let newGoed = new Set(goed);
  switch (action.type) {
    case "reset":
      newGoed = new Set();
      break;

    case "add":
      console.debug("adding", action.player);
      newGoed.add(action.player);
      break;

    default:
      console.error("reduceGoed couldn't match action:", action);
      break;
  }
  console.debug("after", goed.size); // TEMP
  return newGoed;
}

//// Hook

export function useRound(playerCount, dealer, deck) {
  //// States and Constants

  const [{ crib, hands, piles, sharedStack }, dispatchStates] = useReducer(
    reduceStates,
    INITIAL_STATES
  );

  const stackTotal = totalPoints(sharedStack); // sharedStack.reduce(
  //   (partialSum, { rank }) => partialSum + rank.points,
  //   0
  // );

  const [starter, setStarter] = useState(null);

  const [{ toPlay, stage }, dispatchNextPlay] = useReducer(reduceNextPlay, {
    toPlay: new Set([dealer]),
    stage: "reset",
  });

  // who to deal to next
  const dealTo =
    playerCount === 2
      ? // 2 players
        hands[0].length + hands[1].length === 12
        ? null
        : hands[0].length > hands[1].length
        ? 1
        : 0
      : // 3 players
      crib.length === 1
      ? null
      : hands[0].length + hands[1].length + hands[2].length === 15
      ? -1
      : hands[0].length > hands[1].length
      ? 1
      : hands[1].length > hands[2].length
      ? 2
      : 0;

  // players who have goed since sharedStack last reset
  const [goed, dispatchGoed] = useReducer(reduceGoed, new Set());

  //// Helpers - Getters & Checkers

  // use to get the unique player to play next when applicable
  function getToPlay() {
    return [...toPlay][0];
  }

  function totalPoints(cards) {
    return cards.reduce((partialSum, { rank }) => partialSum + rank.points, 0);
  }

  function checkClaim(cards, claim) {
    switch (claim) {
      case "15":
        return totalPoints(cards) === 15;

      case "kind":
        let { rank, suit } = cards[0];
        return cards.every((card) => card.rank === rank && card.suit === suit);

      case "run":
        return cards
          .map((card) => card.index)
          .sort()
          .every(
            (num, index, nums) => index === 0 || num === nums[index - 1] + 1
          );

      default:
        console.log("isValidPlay couldn't match claim:", claim);
    }
    return false;
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

  // deal - TODO: NEXT: NEXT: revert to function?
  useEffect(() => {
    if (stage === "deal") {
      if (dealTo === null) {
        // stop dealing
        allToPlay("discard");
      } else if (dealTo === -1) {
        // deal to crib
        let card = deck.draw(1)[0];
        dispatchStates({ type: "deal-crib", card });
      } else {
        // deal to next player
        let card = deck.draw(1)[0];
        dispatchStates({ type: "deal-player", player: dealTo, card });
      }
    }
  });

  // once everyone has submitted to the crib
  useEffect(() => {
    if (stage === "discard" && crib.length === 4) {
      setNextPlay(dealer + 1, "cut");
    }
  });

  // skip players out of cards in play stage, if stage not over
  useEffect(() => {
    if (
      stage === "play" &&
      hands[getToPlay()].length === 0 &&
      hands[0].length + hands[1].length + hands[2].length > 0
    ) {
      incrementNextPlay();
    }
  });

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
  });

  //// Functions

  function deal() {
    // const amountToDeal = playerCount === 2 ? 6 : 5;

    // for (let index = 0; index < amountToDeal; index++) {
    //   for (let player = 0; player < playerCount; player++) {
    //     let card = deck.draw(1)[0];
    //     console.debug(
    //       `Drew ${card.rank.symbol} of ${card.suit.name}s for ${player}`
    //     ); // TEMP
    //     dispatchStates({ type: "deal-player", player, card });
    //   }
    // }

    // if (playerCount === 3) {
    //   let card = deck.draw(1)[0];
    //   console.debug(`Drew ${card.rank.symbol} of ${card.suit.name} for crib`); // TEMP
    //   dispatchStates({ type: "deal-crib", card });
    // }

    setNextPlay(dealer, "deal");
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
    setStarter(deck.draw(1)[0]);
    deck.uncut();
    setNextPlay(dealer + 1, "play");
  }

  function isValidPlay(index, claim, amount = sharedStack.length + 1) {
    const card = hands[getToPlay()][index];

    // can't play if it goes over 31
    if (stackTotal + card.rank.points > 31) return false;

    // can't claim if stack doesn't have enough cards
    if (sharedStack.length + 1 < amount) return false;

    const cards = [...sharedStack.slice(sharedStack.length - amount), card];

    // now check claim
    return checkClaim(cards, claim);
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
  }

  // may check opponent's hand, so need player param (-1 for crib)
  function canScorePoints(player, indices, claim) {
    let hand = hands[player] || crib;
    let cards = hand.filter((_, index) => indices.includes(index));
    if (indices.includes(6)) cards.push(starter);

    checkClaim(cards, claim);
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

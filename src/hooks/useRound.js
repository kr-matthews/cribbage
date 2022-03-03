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
      let playedCard = newStates.hands[action.player].splice(
        action.index,
        1
      )[0];
      newStates.piles[action.player].push(playedCard);
      newStates.sharedStack.push(playedCard);
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
      newNextPlay.toPlay = new Set([action.player % action.playerCount]);
      action.stage && (newNextPlay.stage = action.stage);
      break;

    default:
      console.error("reduceToPlay couldn't match action:", action);
      break;
  }
  return newNextPlay;
}

function reduceGoed(goed, action) {
  let newGoed = new Set(goed);
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
    stage: "deal",
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

  // player is active in "play" stage if has cards and hasn't goed
  const inactive = Array(playerCount)
    .fill(null)
    .map((_, player) => goed.has(player) || hands[player].length === 0);

  //// Helpers - Getters & Checkers

  // use to get the unique player to play next when applicable
  function getToPlay() {
    return [...toPlay][0];
  }

  function totalPoints(cards) {
    return cards.reduce((partialSum, { rank }) => partialSum + rank.points, 0);
  }

  function checkClaim(cards, claim) {
    if (cards.length < 2) return false;
    switch (claim) {
      case "15":
        return totalPoints(cards) === 15;

      case "kind":
        let rankIndex = cards[0].rank.index;
        return (
          cards.length >= 2 &&
          cards.every((card) => card.rank.index === rankIndex)
        );

      case "run":
        return (
          cards.length >= 3 &&
          cards
            .map((card) => card.rank.index)
            .sort()
            .every(
              (num, index, nums) => index === 0 || num === nums[index - 1] + 1
            )
        );

      case "flush":
        let suitIndex = cards[0].suit.index;
        return (
          cards.length >= 4 &&
          cards.every((card) => card.suit.index === suitIndex)
        );

      default:
        console.error("checkClaim couldn't match claim:", claim);
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

  // deal - TODO: revert to function?
  useEffect(() => {
    if (stage === "dealing") {
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

  // skip players who are inactive (if there are still active players)
  useEffect(() => {
    if (
      ["play", "proceed-to-next-play"].includes(stage) &&
      inactive[getToPlay()] &&
      inactive.includes(false)
    ) {
      incrementNextPlay();
    }
  });

  // if stage not over, once everyone is inactive (or 31 is hit), reset sharedStack
  useEffect(() => {
    if (
      stage === "play" &&
      (inactive.every((bool) => bool) || stackTotal === 31)
    ) {
      dispatchGoed({ type: "reset" });
      dispatchStates({ type: "all-goed" });
      setNextPlay(getToPlay(), "proceed-to-next-play");
    }
  });

  // once all cards have been played in play stage
  useEffect(() => {
    if (stage === "play" && hands.every((hand) => hand.length === 0)) {
      dispatchStates({ type: "re-hand" });
      setNextPlay(dealer + 1, "proceed-to-scoring");
    }
  });

  //// Functions

  function deal() {
    setNextPlay(dealer, "dealing");
  }

  function sendToCrib(player, indices) {
    // move cards in desc order so indices don't get changed as we go
    const descIndices = indices.sort().reverse();
    for (let index of descIndices) {
      dispatchStates({ type: "discard", player, index });
    }

    dispatchNextPlay({ type: "remove", player });
  }

  function cut() {
    deck.cut();
    setNextPlay(dealer, "flip");
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

    // if no claim (for points) then it's good
    if (!claim) return true;

    // can't claim if stack doesn't have enough cards
    if (sharedStack.length + 1 < amount) return false;

    const cards = [...sharedStack.slice(sharedStack.length - amount - 1), card];

    // now check claim
    return checkClaim(cards, claim);
  }

  function play(index) {
    dispatchStates({ type: "play", player: getToPlay(), index });
    incrementNextPlay();
  }

  function isValidGo() {
    return hands[getToPlay()].every(
      ({ rank }) => stackTotal + rank.points > 31
    );
  }

  function go() {
    dispatchGoed({ type: "add", player: getToPlay() });
    incrementNextPlay();
  }

  // may check opponent's hand, so need player param (-1 for crib)
  /**
   * Checks if specified cards in specified hand/crib add up to 15,
   * form a run, are _-of-a-kind, or form a (valid) flush.
   *
   * @param {int} player Index of player, or -1 for crib
   * @param {Array<int>} indices indices of cards in hand/crib plus starter
   * @param {string} claim "15", "run", "kind", or "flush"
   */
  function canScorePoints(player, indices, claim) {
    let isCrib = !hands[player];
    let amount = indices.length;
    let isUsingStarter = indices.includes(6);

    let hand = hands[player] || crib;
    let cards = hand.filter((_, index) => indices.includes(index));
    if (isUsingStarter) cards.push(starter);

    // flush considerations

    // crib can only score a flush with all 5 cards
    if (isCrib && claim === "flush" && amount !== 5) return false;

    // 4-card flush cannot use starter
    if (claim === "flush" && amount === 4 && isUsingStarter) return false;

    // NOTE: TODO: avoid double-counting sub-kinds and sub-runs and sub-flushes

    return checkClaim(cards, claim);
  }

  function scoreHand() {
    if (getToPlay() === dealer) {
      setNextPlay(dealer, "crib");
    } else {
      incrementNextPlay();
    }
  }

  function scoreCrib() {
    setNextPlay(null, "done");
  }

  function reset(cards) {
    dispatchStates({ type: "reset" });
    setStarter(null);
    deck.reset(cards);
    setNextPlay(dealer, "deal");
  }

  /**
   * Manually continue past an intermediary stage which only
   * exists so players can review the state before moving on.
   */
  function proceed() {
    switch (stage) {
      case "proceed-to-next-play":
        setNextPlay(getToPlay(), "play");
        break;

      case "proceed-to-scoring":
        setNextPlay(getToPlay(), "score");
        break;

      default:
        console.warn("proceed didn't match any stage", stage);
        break;
    }
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
    proceed,
  };
}

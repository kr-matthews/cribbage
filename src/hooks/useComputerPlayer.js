import { useEffect, useState } from "react";
import {
  autoScoreStackForClaimType,
  claimTypes,
} from "../playing-cards/cardHelpers";
import Action from "./Action";

export default function useComputerPlayer(
  playerCount,
  playerIndex,
  needsControlling,
  needsToAct,
  actions,
  nextAction,
  hand,
  sharedStack,
  stackTotal
) {
  const [toActFlag, setToActFlag] = useState(false);

  // !!! actually pick which cards to discard
  const indicesToDiscard = hand && (playerCount === 2 ? [1, 5] : [2]);

  const canPlay =
    hand && hand.some((card) => stackTotal + card.rank.points <= 31);

  // !!! actually pick which card to play first
  const bestFirstPlay = 0;

  function pointsForPlayingIndex(ind) {
    if (stackTotal + hand[ind].rank.points > 31) return -1;
    let newStack = [...sharedStack, hand[ind]];
    let points = 0;

    for (let claimType of claimTypes) {
      if (claimType === "flush") continue; // skip flush
      points += autoScoreStackForClaimType(newStack, claimType);
    }

    return points;
  }

  const pointsForPlaying =
    hand && hand.map((_, ind) => pointsForPlayingIndex(ind));

  const indexToPlay = hand
    ? sharedStack.length === 0
      ? bestFirstPlay
      : pointsForPlaying.indexOf(Math.max(...pointsForPlaying))
    : null;

  //// act ////

  function act() {
    switch (nextAction) {
      case Action.CUT_FOR_DEAL:
        actions.cutForDealFunction();
        break;

      case Action.START_FIRST_GAME:
        actions.startFirstGame();
        break;

      case Action.START_NEW_GAME:
        actions.startNewGame();
        break;

      case Action.START_NEW_ROUND:
        actions.startNewRound();
        break;

      case Action.START_DEALING:
        actions.deal();
        break;

      case Action.DISCARD:
        actions.discard(playerIndex, indicesToDiscard);
        break;

      case Action.CUT_FOR_STARTER:
        actions.cutForStarter();
        break;

      case Action.FLIP_STARTER:
        actions.flipStarter();
        break;

      case Action.PLAY_OR_GO:
        canPlay ? actions.play(indexToPlay) : actions.go();
        break;

      case Action.RETURN_CARDS_TO_HANDS:
        actions.returnCardsToHands();
        break;

      case Action.FLIP_PLAYED_CARDS:
        actions.flipPlayedCards();
        break;

      case Action.SCORE_HAND:
        actions.scoreHand();
        break;

      case Action.SCORE_CRIB:
        actions.scoreCrib();
        break;

      default:
        break;
    }
  }

  //// Effects ////

  useEffect(() => {
    function getRandomTimeoutDuration() {
      // between 1 and 2.5 seconds
      // !! make timeout dependent on next action
      return 1750 + Math.random() * 750;
    }

    if (needsControlling && needsToAct) {
      setTimeout(() => {
        // use of flag to avoid re-renders mid-execution of `act` function
        setToActFlag(true);
      }, getRandomTimeoutDuration());
    }
  }, [needsControlling, needsToAct, nextAction, playerIndex]); // ~ playerIndex for log

  useEffect(() => {
    if (toActFlag) {
      act();
      setToActFlag(false);
    }
  });
}

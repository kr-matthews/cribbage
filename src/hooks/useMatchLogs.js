import { useCallback, useEffect, useReducer } from "react";
import Action from "./Action";
import Rank from "../playing-cards/Rank.js";

// amount of messages to keep
const DEFAULT_LIMIT = 30;

function messagesReducer(messages, action) {
  let newMessages = messages;
  switch (action.type) {
    case "reset":
      newMessages = [];
      break;

    case "add":
      newMessages = [
        ...messages.slice(
          Math.max(0, messages.length - (action.storageLimit - 1))
        ),
        action.message,
      ];
      break;

    default:
      console.error("messagesReducer couldn't recognize action", action);
      break;
  }
  return newMessages;
}

export function useMatchLogs(
  players,
  userPosition,
  dealerPosition,
  previousPlayer,
  previousAction,
  cuts,
  starter,
  piles,
  stackTotal,
  delta,
  scorer,
  storageLimit = DEFAULT_LIMIT
) {
  //// States ////

  const [messages, dispatchMessages] = useReducer(messagesReducer, []);

  //// Actions ////

  // generic, black
  const postUpdate = useCallback(
    (text) => {
      let message = {
        type: "auto",
        text,
        timestamp: Date.now(),
      };
      dispatchMessages({ type: "add", message, storageLimit });
    },
    [dispatchMessages, storageLimit]
  );

  // todo: ideally, make the messages formatable strings which accept arguments

  // colour-coded, starting with player name
  const postAction = useCallback(
    (player, action, cuts, starter, piles, stackTotal, delta, scorer) => {
      // base message
      let message = {
        type: "auto",
        colour: players[player].colour,
        text: `${players[player].name} `,
        timestamp: Date.now(),
      };
      let needExtraMessage = false;
      const s = player === userPosition ? "" : "s";
      const yourOrTheir = userPosition === player ? "your" : "their";
      const yourTheirOrThe =
        userPosition === dealerPosition
          ? "your"
          : player === dealerPosition
          ? "their"
          : "the";

      // add details to text
      switch (action) {
        case null:
          return;

        case Action.RESET_ALL:
          message.text += `reset${s} the match and all history.`;
          break;

        case Action.SET_UP_CUT_FOR_DEAL:
          message.text += `confirm${s} current players and shuffle${s} the deck.`;
          break;

        case Action.CUT_FOR_DEAL:
          if (!cuts[player]) return;
          message.text += `cut${s} a${
            [1, 8].includes(cuts[player].rank.points) ? "n" : ""
          } ${cuts[player].rank.name}.`;
          break;

        case Action.SET_UP_CUT_FOR_DEAL_RETRY:
          message.text += `reshuffle${s} the deck.`;
          break;

        case Action.START_FIRST_GAME:
          message.text += `claim${s} dealership and shuffle${s} the deck for the first game.`;
          break;

        case Action.START_NEW_GAME:
          message.text += `shuffle${s} the deck for a new game.`;
          break;

        case Action.START_NEW_ROUND:
          message.text += `shuffle${s} the deck for the next round.`;
          break;

        case Action.START_DEALING:
          message.text += `deal${s} the cards for the new round.`;
          break;

        case Action.CONTINUE_DEALING:
          return;

        case Action.DISCARD:
          message.text += `discard${s} to ${yourTheirOrThe} crib.`;
          break;

        case Action.CUT_FOR_STARTER:
          message.text += `cut${s} the deck.`;
          break;

        case Action.FLIP_STARTER:
          message.text += `reveal${s} the starter to be the ${
            starter.rank.name
          } of ${starter.suit.name}s${delta > 0 ? ` for ${delta}` : ""}.`;
          break;

        case Action.PLAY:
          message.text += `play${s} the ${
            piles[player][piles[player].length - 1].rank.name
          } of ${
            piles[player][piles[player].length - 1].suit.name
          }s and say${s} '${stackTotal}${delta > 0 ? ` for ${delta}` : ""}'.`;
          break;

        case Action.GO:
          needExtraMessage = delta === 1 && scorer !== player;
          message.text += `say${s} 'Go${
            delta > 0 && scorer === player ? ` for ${delta}` : ""
          }'.`;
          break;

        // if someone else scores 1 for a go
        case Action.SCORE_FROM_OTHER_GO:
          message.text += `peg${s} 1.`;
          break;

        case Action.PLAY_OR_GO:
          return;

        case Action.FLIP_PLAYED_CARDS:
          message.text += `start${s} a new play.`;
          break;

        case Action.RETURN_CARDS_TO_HANDS:
          message.text += `end${s} the play phase.`;
          break;

        case Action.SCORE_HAND:
          message.text += `score${s} ${delta} from ${yourOrTheir} hand.`;
          break;

        case Action.SCORE_CRIB:
          message.text += `score${s} ${delta} from ${yourTheirOrThe} crib.`;
          break;

        default:
          return;
      }

      // log the message
      dispatchMessages({ type: "add", message, storageLimit });

      // !!! this isn't working proeprly
      // if someone else pegged 1 from this GO
      if (needExtraMessage) {
        dispatchMessages({
          type: "add",
          message: {
            type: "auto",
            colour: players[scorer].colour,
            text: `${players[scorer].name} score${
              scorer === userPosition ? "" : "s"
            } 1.`,
            timestamp: Date.now(),
          },
        });
      }
    },
    [players, userPosition, dealerPosition, dispatchMessages, storageLimit]
  );

  function reset() {
    dispatchMessages({ type: "reset" });
  }

  //// Effects ////

  // automatically post message based on previous action
  useEffect(() => {
    if (previousAction) {
      postAction(
        previousPlayer,
        previousAction,
        cuts,
        starter,
        piles,
        stackTotal,
        delta,
        scorer
      );
    }
  }, [
    previousPlayer,
    previousAction,
    cuts,
    starter,
    piles,
    stackTotal,
    delta,
    scorer,
    postAction,
  ]);

  //// Return ////

  return { messages, postUpdate, reset };
}

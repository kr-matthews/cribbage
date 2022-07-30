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
    (player, action, cuts, starter, piles, stackTotal, delta) => {
      // base message
      let message = {
        type: "auto",
        colour: players[player].colour,
        text: `${players[player].name} `,
        timestamp: Date.now(),
      };

      // add details to text
      switch (action) {
        case null:
          return;

        case Action.RESET_ALL:
          message.text += "reset the match and all history.";
          break;

        case Action.SET_UP_CUT_FOR_DEAL:
          message.text += "confirmed players and shuffled the deck.";
          break;

        case Action.CUT_FOR_DEAL:
          if (!cuts[player]) return;
          message.text += `cut a${
            [1, 8].includes(cuts[player].rank.points) ? "n" : ""
          } ${cuts[player].rank.name}.`;
          break;

        case Action.SET_UP_CUT_FOR_DEAL_RETRY:
          message.text += "reshuffled the deck.";
          break;

        case Action.START_FIRST_GAME:
          message.text +=
            "claimed dealer and shuffled the deck for the first game.";
          break;

        case Action.START_NEW_GAME:
          message.text += "shuffled the deck for a new game.";
          break;

        case Action.START_NEW_ROUND:
          message.text += "shuffled the deck for the next round.";
          break;

        case Action.START_DEALING:
          message.text += "dealt the cards for the new round.";
          break;

        case Action.CONTINUE_DEALING:
          return;

        case Action.DISCARD:
          // message.text += `discarded ${count} card${
          //   count === 1 ? "" : "s"
          // } to the crib.`;
          message.text += `discarded to ${
            userPosition === dealerPosition
              ? "your"
              : player === dealerPosition
              ? "their"
              : "the"
          } crib.`;
          break;

        case Action.CUT_FOR_STARTER:
          message.text += "cut the deck.";
          break;

        case Action.FLIP_STARTER:
          // if (!starter) return;
          message.text += `revealed the starter to be the ${
            starter.rank.name
          } of ${starter.suit.name}s${
            starter.rank.symbol === Rank.JACK ? " for 2" : ""
          }.`;
          break;

        case Action.PLAY:
          message.text += `played the ${
            piles[player][piles[player].length - 1].rank.name
          } of ${
            piles[player][piles[player].length - 1].suit.name
          }s: '${stackTotal}${false ? ` for ${"some"}` : ""}'.`;
          break;

        case Action.GO:
          message.text += ": 'Go'.";
          break;

        case Action.PLAY_OR_GO:
          return;

        case Action.FLIP_PLAYED_CARDS:
          message.text += "finished the play.";
          break;

        case Action.RETURN_CARDS_TO_HANDS:
          message.text += "ended the play phase.";
          break;

        case Action.SCORE_HAND:
          message.text += `scored ${delta} from ${
            userPosition === player ? "your" : "their"
          } hand.`;
          break;

        case Action.SCORE_CRIB:
          message.text += `scored ${delta} from ${
            userPosition === dealerPosition
              ? "your"
              : player === dealerPosition
              ? "their"
              : "the"
          } crib.`;
          break;

        default:
          return;
      }

      // log the message
      dispatchMessages({ type: "add", message, storageLimit });
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
        delta
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
    postAction,
  ]);

  //// Return ////

  return { messages, postUpdate, reset };
}

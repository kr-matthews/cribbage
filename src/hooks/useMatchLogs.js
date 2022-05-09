import { useCallback, useEffect, useReducer } from "react";
import Action from "./Action";

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
  previousPlayer,
  previousAction,
  data,
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

  // colour-coded, starting with player name
  const postAction = useCallback(
    (player, action, data) => {
      let { card, points, stackTotal, count } = data || {};

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

        case Action.CUT_FOR_DEAL:
          message.text += `cut a${
            [1, 8].includes(card.rank.points) ? "n" : ""
          } ${card.rank.name}.`;
          break;

        case Action.DISCARD:
          message.text += `discarded ${count} card${
            count === 1 ? "" : "s"
          } to the crib.`;
          break;

        case Action.FLIP_STARTER:
          message.text += `revealed the starter to be the ${card.rank.name} of ${card.suit.name}s.`;
          break;

        case Action.PLAY:
          message.text += `played the ${card.rank.name} of ${card.suit.name}s: '${stackTotal} for ${points}'.`; // !!! remove points if 0
          break;

        case Action.SCORE_HAND:
          message.text += `scored ${points} from their hand.`; // ! from your hand
          break;

        case Action.SCORE_CRIB:
          message.text += `scored ${points} from the crib.`;
          break;

        default:
          if (action.pastDescription) {
            message.text += `${action.pastDescription}.`;
          } else return;
      }

      // log the message
      dispatchMessages({ type: "add", message, storageLimit });
    },
    [players, dispatchMessages, storageLimit]
  );

  function reset() {
    dispatchMessages({ type: "reset" });
  }

  //// Effects ////

  // automatically post message based on previous action
  useEffect(() => {
    if (previousAction) {
      postAction(previousPlayer, previousAction, data);
    }
  }, [previousPlayer, previousAction, data, postAction]);

  //// Return ////

  return { messages, postUpdate, reset };
}

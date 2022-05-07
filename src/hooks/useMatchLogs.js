import { useCallback, useEffect, useReducer } from "react";

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
  storageLimit = DEFAULT_LIMIT
) {
  //// States ////

  const [messages, dispatchMessages] = useReducer(messagesReducer, []);

  //// Actions ////

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

  // TODO: NEXT: NEXT: decide how to log actions with additional data (cards, points) and remove temporary log below

  const postAction = useCallback(
    (players, player, action) => {
      if (action && action.pastDescription) {
        let message = {
          type: "auto",
          colour: players[player].colour,
          text: `${players[player].name} ${action && action.pastDescription}.`,
          timestamp: Date.now(),
        };
        dispatchMessages({ type: "add", message, storageLimit });
      } else if (action && action.label)
        dispatchMessages({
          type: "add",
          storageLimit,
          message: {
            text: (action && action.label) + " - more details required (WIP)",
            timestamp: Date.now(),
          },
        }); // TEMP
    },
    [dispatchMessages, storageLimit]
  );

  function reset() {
    dispatchMessages({ type: "reset" });
  }

  //// Effects ////

  useEffect(() => {
    if (previousAction) {
      postAction(players, previousPlayer, previousAction);
    }
  }, [players, previousPlayer, previousAction, postAction]);

  //// Return ////

  return { messages, postUpdate, postAction, reset };
}

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
  names,
  colours,
  previousPlayer,
  previousAction,
  storageLimit = DEFAULT_LIMIT
) {
  //// States ////

  const [messages, dispatchMessages] = useReducer(messagesReducer, []);

  //// Helpers ////

  const addMessage = useCallback(
    (names, colours, player, action) => {
      let message = {
        type: "auto",
        colour: colours[player],
        text: `${names[player]} did ${action.label}`,
        timestamp: Date.now(),
      };
      dispatchMessages({ type: "add", message, storageLimit });
    },
    [dispatchMessages, storageLimit]
  );

  //// Effects ////

  // TODO: figure out whether addMessage should be used internally via effects, or externally

  useEffect(() => {
    if (previousAction) {
      addMessage(names, colours, previousPlayer, previousAction);
    }
  }, [previousPlayer, previousAction, addMessage]); // TODO: name and colour arrays are recalculated every time, consider combining into one array in App.js

  //// Return ////

  return { messages };
}

const sampleMessages = [
  {
    type: "auto",
    colour: "blue",
    text: "You score 8 points from your hand",
    timestamp: Date.now() + 1,
  },
  {
    type: "auto",
    colour: "red",
    text: "Joe scores 19 points from their hand",
    timestamp: Date.now() + 60001,
  },
  {
    type: "auto",
    colour: "blue",
    text: "You claim 3 missed points from Joe's hand",
    timestamp: Date.now() + 80801,
  },
  {
    type: "manual",
    colour: "red",
    text: "Joe: Nice play!",
    timestamp: Date.now() + 105411,
  },
  {
    type: "auto",
    colour: "red",
    text: "Joe scores 1 point from their crib",
    timestamp: Date.now() + 504541,
  },
  {
    type: "auto",
    colour: "blue",
    text: "You score 8 points from your hand",
    timestamp: Date.now(),
  },
  {
    type: "auto",
    colour: "red",
    text: "Joe scores 19 points from their hand",
    timestamp: Date.now() + 6000,
  },
  {
    type: "auto",
    colour: "blue",
    text: "You claim 3 missed points from Joe's hand",
    timestamp: Date.now() + 8080,
  },
  {
    type: "manual",
    colour: "red",
    text: "Joe: Nice play!",
    timestamp: Date.now() + 10541,
  },
  {
    type: "auto",
    colour: "red",
    text: "Joe scores 1 point from their crib",
    timestamp: Date.now() + 50454,
  },
];

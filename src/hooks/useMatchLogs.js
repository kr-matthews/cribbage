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

        case Action.CUT_FOR_DEAL:
          if (!cuts[player]) return;
          message.text += `cut a${
            [1, 8].includes(cuts[player].rank.points) ? "n" : ""
          } ${cuts[player].rank.name}.`;
          break;

        case Action.DISCARD:
          // message.text += `discarded ${count} card${
          //   count === 1 ? "" : "s"
          // } to the crib.`;
          message.text += `discarded to the crib.`;
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

        case Action.SCORE_HAND:
          message.text += `scored ${delta} from their hand.`; // ! from your hand
          break;

        case Action.SCORE_CRIB:
          message.text += `scored ${delta} from the crib.`;
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

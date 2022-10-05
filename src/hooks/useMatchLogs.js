import { useCallback, useEffect, useReducer } from "react";
import Action from "./Action";

// amount of messages to keep
const DEFAULT_LIMIT = 50;

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
  hasGameWinner,
  gameWinner,
  hasMatchWinner,
  matchWinner,
  skunkCount,
  doubleSkunkCount,
  tripleSkunkCount,
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

  // todo CLEAN-UP: ideally, make the messages formatable strings which accept arguments

  // colour-coded, starting with player name
  const postAction = useCallback(
    (
      player,
      action,
      cuts,
      starter,
      piles,
      stackTotal,
      delta,
      scorer,
      hasGameWinner,
      gameWinner,
      hasMatchWinner,
      matchWinner,
      skunkCount,
      doubleSkunkCount,
      tripleSkunkCount
    ) => {
      if (!players[player]) return;
      // base message
      let message = {
        type: "auto",
        colour: players[player].colour,
        text: `${players[player].isUser ? "You" : players[player].name} `,
        timestamp: Date.now(),
      };
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
        case Action.RESET_ALL:
          return;

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
          message.text += `say${s} 'Go${
            delta > 0 && scorer === player
              ? ` for ${delta}` // get 1 for going last
              : delta === 1 && scorer !== player
              ? `', ${players[scorer].name} says 'for ${delta}` // someone else gets 1 for going last
              : "" // not the last go
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

      if (hasGameWinner) {
        message.text += ` ${
          players[gameWinner].isUser ? "You" : players[gameWinner].name
        } won the game`;
        // if any skunks, add 'with'
        (skunkCount || doubleSkunkCount || tripleSkunkCount) &&
          (message.text += ` with`);
        // if any regular skunks, add those
        skunkCount &&
          (message.text += ` ${skunkCount} skunk${
            skunkCount === 1 ? "" : "s"
          }`);
        // if regular and double, add 'and'
        skunkCount && doubleSkunkCount && (message.text += ` and`);
        // if any double skunks, add those
        doubleSkunkCount &&
          (message.text += ` ${doubleSkunkCount} double skunk${
            doubleSkunkCount === 1 ? "" : "s"
          }`);
        // if triples and something already, add 'and'
        (skunkCount || doubleSkunkCount) &&
          tripleSkunkCount &&
          (message.text += ` and`);
        // if any triple skunks, add those
        tripleSkunkCount &&
          (message.text += ` ${tripleSkunkCount} triple skunk${
            tripleSkunkCount === 1 ? "" : "s"
          }`);
        // finish with punctuation
        message.text +=
          skunkCount || doubleSkunkCount || tripleSkunkCount ? `!` : ".";
      }

      if (hasMatchWinner) {
        // note: overwrite existing text; and matchWinner may have won on someone else's 'go'
        message.text = `${
          players[matchWinner].isUser ? "You" : players[matchWinner].name
        } won the match!`;
        message.colour = players[matchWinner].colour;
      }

      // log the message
      dispatchMessages({ type: "add", message, storageLimit });

      // if someone else pegged 1 from this GO
      // dispatchMessages({
      //   type: "add",
      //   message: {
      //     type: "auto",
      //     colour: players[scorer].colour,
      //     text: `${players[scorer].name} score${
      //       scorer === userPosition ? "" : "s"
      //     } 1.`,
      //     timestamp: Date.now(),
      //   },
      // });
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
        scorer,
        hasGameWinner,
        gameWinner,
        hasMatchWinner,
        matchWinner,
        skunkCount,
        doubleSkunkCount,
        tripleSkunkCount
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
    hasGameWinner,
    gameWinner,
    hasMatchWinner,
    matchWinner,
    skunkCount,
    doubleSkunkCount,
    tripleSkunkCount,
    postAction,
  ]);

  //// Return ////

  return { messages, postUpdate, reset };
}

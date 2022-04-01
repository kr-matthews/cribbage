import { useState, useReducer, useEffect } from "react";

import { useLocalStorage } from "./hooks/useLocalStorage.js";
import { useDeck } from "./hooks/useDeck.js";
import { useCutForDeal } from "./hooks/useCutForDeal.js";
import { useGame } from "./hooks/useGame.js";
import { useGamePoints } from "./hooks/useGamePoints.js";
import { useSoundEffects } from "./hooks/useSoundEffects.js";
import { useNetwork } from "./hooks/useNetwork.js";

import Action from "./hooks/Action.js";

import Header from "./game-components/Header.js";
import Hands from "./game-components/Hands.js";
import PlayArea from "./game-components/PlayArea.js";
import Actions from "./game-components/Actions.js";
import ScoreBoard from "./game-components/ScoreBoard.js";
import PlayHistory from "./game-components/PlayHistory.js";
import Links from "./links/Links.js";

import "./game-components/gameComponents.css";
import "./playing-cards/playingCards.css";

//// Constants ////

// always use four columns
const HIDE_EMPTY_COLUMNS = true;
// hand of size up to 6, plus starter card on the end
const HAND_ALL_UNSELECTED = Array(7).fill(false);
// longest allowed name
const MAX_NAME_LENGTH = 12;

//// Helpers ////

function initialNextPlay(playerCount) {
  let arr = Array(playerCount).fill(false);
  arr[0] = true;
  return {
    nextPlayers: arr,
    nextAction: Action.LOCK_IN_PLAYERS,
  };
}

//// Reducers ////

function playersReducer(players, action) {
  const newPlayers = [...players];
  switch (action.type) {
    case "add":
      newPlayers.push({});
    // intentional fall-through
    // eslint-disable-next-line
    case "update":
      const ind = action.player || newPlayers.length - 1;
      const isComputer = action.isComputer || newPlayers[ind].isComputer;
      const name = action.name || newPlayers[ind].name;
      // const colour = action.colour || newPlayers[ind].colour;
      newPlayers[ind] = { isComputer, name };
      break;
    case "remove":
      newPlayers.splice(action.player, 1);
      break;
    default:
      console.error("playersReducer couldn't recognize action", action);
  }
  return newPlayers;
}

function selectedReducer(selected, action) {
  let newSelected = [...selected];
  switch (action.type) {
    case "click":
      newSelected[action.index] = !newSelected[action.index];
      break;
    case "replace":
      newSelected = [...HAND_ALL_UNSELECTED];
      newSelected[action.index] = !selected[action.index];
      break;
    case "reset":
      newSelected = [...HAND_ALL_UNSELECTED];
      break;
    default:
      console.error("selectedReducer couldn't recognize action", action);
  }
  return newSelected;
}

function reduceNextPlay(nextPlay, { type, player, action, playerCount }) {
  // if new game with new players, need to adjust player count
  if (type === "reset") return initialNextPlay(playerCount);

  // otherwise just use the same player count
  playerCount ||= nextPlay.nextPlayers.length;
  let newNextPlay = {
    // copy current players
    nextPlayers: [...nextPlay.nextPlayers],
    // use provided next action, or default to current next action
    nextAction: action || nextPlay.nextAction,
  };

  switch (type) {
    case "remove":
      newNextPlay.nextPlayers[player % playerCount] = false;
      break;

    case "all":
      newNextPlay.nextPlayers = Array(playerCount).fill(true);
      break;

    case "next":
      let oldPlayer = newNextPlay.nextPlayers.indexOf(true);
      let newPlayer = (oldPlayer + 1) % playerCount;
      newNextPlay.nextPlayers[oldPlayer] = false;
      newNextPlay.nextPlayers[newPlayer] = true;
      break;

    default:
      // player and action given directly, independent of prior state
      newNextPlay.nextPlayers = Array(playerCount).fill(false);
      newNextPlay.nextPlayers[player % playerCount] = true;
      break;
  }
  return newNextPlay;
}

//// Helpers ////

function getRandomName() {
  let names = [
    "Skynet",
    "Ava",
    "Jarvis",
    "HAL 900",
    "Matrix",
    "Alie",
    "Tardis",
  ];
  return names[Math.floor(Math.random() * names.length)];
}

////// App //////

export default function App() {
  //// User and Players ////

  // user's name (persists)
  const [userName, setUserName] = useLocalStorage("userName", "Undecided");
  function trySetUserName(input) {
    const newName = input.slice(0, MAX_NAME_LENGTH).trim();
    if (newName.length > 0) {
      setUserName(newName);
    }
  }

  // list of up to 3 players
  const [players, dispatchPlayers] = useReducer(playersReducer, [
    { name: "You", isComputer: false },
  ]);

  // are players locked in, or can new ones join
  const [locked, setLocked] = useState(false);

  // what spot the user is 'sitting' in (can't be 'standing')
  const [position, setPosition] = useState(0);
  const isOwner = position === 0;

  // amount of players present (user is always present)
  const playerCount = players.length;
  const computerCount = players.filter((player) => player.isComputer).length;

  function addComputerPlayer() {
    if (!locked && playerCount < 3) {
      let existingNames = players.map((player) => player.name);
      let name;

      do {
        name = getRandomName();
      } while (existingNames.includes(name));

      dispatchPlayers({
        type: "add",
        isComputer: true,
        name,
      });
    }
  }

  function removePlayer(player) {
    if (!locked && player > 0 && players[player]) {
      dispatchPlayers({ type: "remove", player });
    }
  }

  //// User Experience ////

  // colours on the board; don't use middle track when 2 players
  var colours = ["DarkRed", "DarkGreen", "DarkBlue"];
  playerCount === 2 && colours.splice(1, 1);

  // sound effects (can be muted)
  const soundEffects = useSoundEffects();

  //// Network/Remote ////

  // handle network connection, for remote play (can still play locally if there's no connection)
  const network = useNetwork({ capacityPerCode: 3, playerCount });

  //// Cards and Play ////

  // the next action to be taken, and by who
  // (only 1 player to play next, unless discarding to crib)
  const [{ nextPlayers, nextAction }, dispatchNextPlay] = useReducer(
    reduceNextPlay,
    playerCount,
    initialNextPlay
  );

  // if there's a unique next player, get them from here
  const nextPlayer = nextPlayers.indexOf(true);

  // the deck (used pre-game, to cut for deal); pass in card stack on reset
  const deck = useDeck();

  // a single iteration of the game, which can be restarted
  const game = useGame(
    deck,
    playerCount,
    nextPlayer,
    nextAction,
    dispatchNextPlay
  );

  // to decide who goes first in the first game
  const cutForDeal = useCutForDeal(deck, playerCount, dispatchNextPlay);

  // track game points across multiple games
  const gamePoints = useGamePoints();

  // lock in players to start (but cut for deal before starting first game)
  function start(cards) {
    cutForDeal.reset(cards);
    setLocked(true);
    dispatchNextPlay({ player: 0, action: Action.CUT_FOR_DEAL });
  }

  // which cards from user's hand (plus deck top card) are selected
  const [selected, dispatchSelected] = useReducer(
    selectedReducer,
    HAND_ALL_UNSELECTED
  );
  const selectedCount = selected.filter((bool) => bool).length;
  const selectedIndices = selected
    .map((bool, index) => (bool ? index : null))
    .filter((index) => index !== null);

  //// Next Action ////

  // defaults, to override when necessary in the switch statement below
  let labels = [nextAction.label];
  let actions = [];
  let enabled = [true];
  let clickDeckHandler = null;
  let clickCardHandler = null;

  switch (nextAction) {
    case Action.LOCK_IN_PLAYERS:
      labels = [nextAction.label];
      actions = [
        () => {
          if (network.mode === "remote" && computerCount === playerCount - 1) {
            // have to leave remote play if they want to start
            if (
              window.confirm(
                "You are starting a remote game with only yourself and computer players, and will therefore automatically be switched back to local play now."
              )
            ) {
              // they agree; leave remote play
              network.leave();
            } else {
              // they cancelled the start
              return;
            }
          }
          // start the game (possibly after leaving remote play)
          start();
        },
      ];
      enabled = [isOwner && [2, 3].includes(playerCount)];
      break;

    case Action.CUT_FOR_DEAL:
      actions = [cutForDeal.cut];
      clickDeckHandler = actions[0];
      break;

    case Action.RETRY_CUT_FOR_DEAL:
      actions = [() => cutForDeal.retry()];
      clickDeckHandler = actions[0];
      break;

    case Action.START_FIRST_GAME:
      actions = [
        () => {
          cutForDeal.reset();
          game.start(cutForDeal.firstDealer);
        },
      ];
      clickDeckHandler = actions[0];
      break;

    case Action.START_DEALING:
      actions = [game.deal];
      clickDeckHandler = actions[0];
      break;

    case Action.DEAL:
      labels = [];
      actions = [];
      enabled = [];
      break;

    case Action.DISCARD:
      actions = [
        () => {
          game.discardToCrib(nextPlayer, selectedIndices);
          dispatchSelected({ type: "reset" });
        },
      ];
      enabled = [selectedCount === 4 - playerCount];
      clickCardHandler = (index) => {
        dispatchSelected({ type: "click", index });
      };
      break;

    case Action.CUT_FOR_STARTER:
      actions = [game.cut];
      clickDeckHandler = actions[0];
      break;

    case Action.FLIP_STARTER:
      actions = [game.flip];
      clickDeckHandler = actions[0];
      break;

    case Action.PLAY:
      labels = ["Play", "Go"]; // TODO: add option for claiming various types of points (?)
      actions = [
        () => {
          game.play(selectedIndices[0]);
          dispatchSelected({ type: "reset" });
        },
        () => {
          game.go();
          dispatchSelected({ type: "reset" });
        },
      ];
      enabled = [
        selectedCount === 1 && game.isValidPlay(selectedIndices[0]),
        game.isValidGo(),
      ];
      clickCardHandler = (index) => {
        dispatchSelected({ type: "replace", index });
      };
      break;

    case Action.FLIP_PLAYED_CARDS:
      actions = [game.endPlay];
      break;

    case Action.RETURN_CARDS_TO_HANDS:
      actions = [game.returnToHand];
      break;

    case Action.SCORE_HAND: // TODO: add options to claim points (?)
      actions = [game.scoreHand];
      break;

    case Action.SCORE_CRIB:
      actions = [game.scoreCrib];
      break;

    case Action.START_NEW_ROUND:
      actions = [() => game.restartRound()];
      clickDeckHandler = actions[0];
      break;

    default:
      console.error("App couldn't recognize next action", nextAction);
      break;
  }

  //// Effects ////

  // reset if player count changes
  useEffect(() => {
    dispatchNextPlay({ type: "reset", playerCount });
  }, [playerCount]);

  //// Return ////

  return (
    // TEMP: WIP note
    <div className="app">
      This Cribbage project is a work-in-progress. Proper functionality is not
      guaranteed.
      <ScoreBoard
        gamePoints={gamePoints}
        currentScores={game.currentScores}
        priorScores={game.previousScores}
      />
      <Header
        hideEmptyColumns={HIDE_EMPTY_COLUMNS}
        userName={userName}
        updateUserName={trySetUserName}
        userPosition={position}
        dealerPosition={game.dealer}
        mode={network.mode}
        isSoundOn={soundEffects.isOn}
        toggleSound={soundEffects.toggle}
        code={network.code}
        create={network.create}
        join={network.join}
        leave={network.leave}
        canAddPlayer={
          isOwner && nextAction === Action.LOCK_IN_PLAYERS && playerCount < 3
        }
        addPlayer={addComputerPlayer}
        players={players}
        nextPlayers={nextPlayers}
        scores={game.currentScores}
        colours={colours}
        removeable={
          isOwner &&
          nextAction === Action.LOCK_IN_PLAYERS && [false, true, true]
        }
        removePlayer={removePlayer}
      />
      <Hands
        hideEmptyColumns={HIDE_EMPTY_COLUMNS}
        crib={game.crib}
        hands={game.hands}
        activePosition={nextPlayer} // TEMP: position
        selectedCards={selected}
        clickCardHandler={clickCardHandler} // TEMP: nextPlayers[position] && clickCardHandler
        maxSize={game.crib.length === 4 ? 4 : 8 - playerCount}
      />
      <PlayArea
        hideEmptyColumns={HIDE_EMPTY_COLUMNS}
        deckSize={deck.unCutCount}
        isDeckCutInPlace={nextAction === Action.FLIP_STARTER}
        deckBottomSize={nextAction === Action.FLIP_STARTER && deck.unCutCount}
        deckTopSize={nextAction === Action.FLIP_STARTER && deck.cutCounts[0]}
        starter={game.starter}
        isStarterSelected={selected[6]}
        clickDeckHandler={nextPlayers[position] && clickDeckHandler}
        piles={game.piles}
        cutSizes={deck.cutCounts}
        cutCards={cutForDeal.cuts}
      />
      <Actions
        waiting={!nextPlayers[position]}
        nextToAct={
          nextPlayers.reduce((count, curr) => count + (curr ? 1 : 0), 0) === 1
            ? players[nextPlayer].name
            : "everyone else"
        }
        nextAction={
          nextPlayers[position]
            ? nextAction.internalMessage
            : nextAction.externalMessage
        }
        labels={labels}
        actions={actions}
        enabled={enabled}
      />
      <PlayHistory messages={sampleMessages} />
      <Links
        gitHubLink="https://github.com/kr-matthews/cribbage"
        themeType="light"
      />
    </div>
  );
}

const sampleMessages = [
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

// for tests
export { reduceNextPlay };

import { useState, useReducer } from "react";

import { useLocalStorage } from "./hooks/useLocalStorage.js";
import { useGame } from "./hooks/useGame.js";
import { useSoundEffects } from "./hooks/useSoundEffects.js";
import { useGamePoints } from "./hooks/useGamePoints.js";
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
  const newSelected = [...selected];
  switch (action.type) {
    case "click":
      newSelected[action.index] = !newSelected[action.index];
      break;
    case "reset":
      return HAND_ALL_UNSELECTED;
    default:
      console.error("selectedReducer couldn't recognize action", action);
  }
  return newSelected;
}

////// App //////

export default function App() {
  //// States ////

  // user's name (persists)
  const [userName, setUserName] = useLocalStorage("userName", "Undecided");
  function trySetUserName(input) {
    const newName = input.slice(0, 12).trim();
    if (newName.length > 0) {
      setUserName(newName);
    }
  }

  // list of up to 3 players
  const [players, dispatchPlayers] = useReducer(playersReducer, [
    { name: "You", isComputer: false },
  ]);
  // amount of players present (user is always present)
  const playerCount = players.length;

  // what spot the user is 'sitting' in (can't be 'standing')
  const [position, setPosition] = useState(0);

  // the game
  const game = useGame(playerCount, position === 0);
  // sound effects (can be muted)
  const soundEffects = useSoundEffects();
  // track game points across multiple games
  const gamePoints = useGamePoints();
  // handle network connection, for remote play (can still play locally if there's no connection)
  const network = useNetwork({ capacityPerCode: 3, playerCount });

  // whether the game has started (ie whether new players can join)
  const isGameStarted = game.nextAction !== Action.START;

  // which cards from user's hand (plus deck top card) are selected
  const [selected, dispatchSelected] = useReducer(
    selectedReducer,
    HAND_ALL_UNSELECTED
  );
  const selectedCount = selected.filter((bool) => bool).length;

  // colours on the board; don't use middle track when 2 players
  var colours = ["DarkRed", "DarkGreen", "DarkBlue"];
  playerCount === 2 && colours.splice(1, 1);

  //// Functions ////

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

  function addComputerPlayer() {
    // TODO: NEXT: leave remote play if starting game with only computers (not here)
    if (playerCount < 3) {
      dispatchPlayers({
        type: "add",
        isComputer: true,
        name: getRandomName(),
      });
    }
  }

  // TODO: NEXT: use removePlayer
  function removePlayer(player) {
    // only owner can remove, only pre-game, and can't remove self
    if (!isGameStarted && position === 0 && player > 0 && players[player]) {
      dispatchPlayers({ type: "remove", player });
    }
  }

  //// Temporary sample functionality ////

  const sampleLabels = [
    "Add Player",
    "New Game",
    "Cut for Deal",
    "Deal",
    "Discard",
    "Cut for Starter",
    "Flip Starter",
    "Play",
    "Go",
    "Proceed",
    "Score Hand",
    "Score Crib",
    "New Round",
  ];

  const sampleActions = [
    () => {
      if (!isGameStarted) addComputerPlayer();
    },
    () => {
      if (game.nextAction === Action.START) game.start();
    },
    () => {
      if (game.nextAction === Action.CUT_FOR_DEAL) game.cutForDeal();
    },
    () => {
      if (game.nextAction === Action.DEAL) game.deal();
    },
    () => {
      if (
        game.nextAction === Action.DISCARD &&
        selectedCount === 4 - playerCount &&
        !selected[6]
      ) {
        game.sendToCrib(
          game.nextPlayers.indexOf(true),
          selected
            .map((bool, index) => (bool ? index : null))
            .filter((index) => index !== null)
        );
      }
      dispatchSelected({ type: "reset" });
    },
    () => {
      if (game.nextAction === Action.CUT_FOR_STARTER) game.cut();
    },
    () => {
      if (game.nextAction === Action.FLIP_STARTER) game.flip();
    },
    () => {
      let index = selected.findIndex((bool) => bool);
      if (
        game.nextAction === Action.PLAY &&
        selectedCount === 1 &&
        index !== 6 &&
        game.isValidPlay(index)
      ) {
        game.play(index);
      } else {
        alert("invalid play");
      }
      dispatchSelected({ type: "reset" });
    },
    () => {
      if (game.nextAction === Action.PLAY && game.isValidGo()) {
        game.go();
      } else {
        alert("invalid go");
      }
      dispatchSelected({ type: "reset" });
    },
    () => {
      if (
        [Action.PROCEED_PLAY, Action.PROCEED_SCORING].includes(game.nextAction)
      )
        game.proceed();
    },
    () => {
      if (game.nextAction === Action.SCORE_HAND) game.scoreHand();
    },
    () => {
      if (game.nextAction === Action.SCORE_CRIB) game.scoreCrib();
    },
    () => {
      if (game.nextAction === Action.RESET_ROUND) game.restartRound();
    },
  ];

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
        players={players}
        colours={colours}
        scores={[46, 67, 80]} // TEMP
      />
      <Hands
        hideEmptyColumns={HIDE_EMPTY_COLUMNS}
        crib={game.crib}
        hands={game.hands}
        activePosition={game.nextPlayers.indexOf(true)} // TEMP
        selectedCards={selected}
        clickCardHandler={(index) => dispatchSelected({ type: "click", index })} // TODO: only when clickable
        maxSize={8 - playerCount}
      />
      <PlayArea
        hideEmptyColumns={HIDE_EMPTY_COLUMNS}
        deckSize={game.deckSize}
        deckBottomSize={game.deckBottomSize}
        deckTopSize={game.deckTopSize}
        isDeckCut={game.isDeckCut}
        starter={game.starter}
        isStarterSelected={selected[6]}
        clickDeckHandler={() => dispatchSelected({ type: "click", index: 6 })} // TODO: only when clickable; allow click to cut or flip
        playStacks={game.piles} // TODO: rename to piles
      />
      <Actions
        waiting={!game.nextPlayers[position]}
        nextToAct={
          game.nextPlayers.reduce(
            (count, curr) => count + (curr ? 1 : 0),
            0
          ) === 1
            ? players[game.nextPlayers.indexOf(true)].name
            : "everyone else"
        }
        nextAction={game.nextAction.externalMessage}
        labels={sampleLabels} // TEMP
        actions={sampleActions} // TEMP: these need validation checks - correct player, stage, valid input
        enabled={sampleEnabled} // TEMP
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

const sampleEnabled = Array(20).fill(true);

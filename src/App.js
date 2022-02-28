import { useState, useReducer } from "react";

import { useLocalStorage } from "./hooks/useLocalStorage.js";
import { useGame } from "./hooks/useGame.js";
import { useSoundEffects } from "./hooks/useSoundEffects.js";
import { useGamePoints } from "./hooks/useGamePoints.js";
import { useNetwork } from "./hooks/useNetwork.js";

import Header from "./game-components/Header.js";
import Hands from "./game-components/Hands.js";
import PlayArea from "./game-components/PlayArea.js";
import Actions from "./game-components/Actions.js";
import ScoreBoard from "./game-components/ScoreBoard.js";
import PlayHistory from "./game-components/PlayHistory.js";
import Links from "./links/Links.js";

import "./game-components/gameComponents.css";
import "./playing-cards/playingCards.css";

//// Constants

// always use four columns
const HIDE_EMPTY_COLUMNS = false; // TODO: make empty cols uniform
// hand of size up to 6, plus starter card on the end
const HAND_ALL_UNSELECTED = Array(7).fill(0);

//// Reducers

function playersReducer(players, action) {
  const newPlayers = [...players];
  switch (action.type) {
    case "add":
    // intentional fall-through
    // eslint-disable-next-line
    case "update":
      const ind = action.player;
      const isComputer = action.isComputer || newPlayers[ind].isComputer;
      const name = action.name || newPlayers[ind].name;
      const colour = action.colour || newPlayers[ind].colour;
      newPlayers[ind] = { isComputer, name, colour };
      break;
    case "remove":
      newPlayers[action.player] = null;
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
  //// States

  // user's name (persists)
  const [userName, setUserName] = useLocalStorage("userName", "Undecided");
  function trySetUserName(input) {
    const newName = input.slice(0, 12).trim();
    if (newName.length > 0) {
      setUserName(newName);
    }
  }

  // list of 3 players (players may be null)
  const [players, dispatchPlayers] = useReducer(playersReducer, [
    // TEMP players
    { name: "Joe", type: "Human" },
    { name: "You", type: "Human" },
    { name: "Claire", type: "Computer" },
  ]);
  // what spot the user is 'sitting' in (can't be 'standing')
  const [position, setPosition] = useState(1);
  // amount of players present (user is always present)
  const playerCount = players.length;

  // the game
  const game = useGame(playerCount, position === 0);
  // sound effects (can be muted)
  const soundEffects = useSoundEffects();
  // track game points across multiple games
  const gamePoints = useGamePoints();
  // handle network connection, for remote play (can still play locally if there's no connection)
  const network = useNetwork({ capacityPerCode: 3, playerCount });

  // which cards from user's hand (plus deck top card) are selected
  const [selected, dispatchSelected] = useReducer(
    selectedReducer,
    HAND_ALL_UNSELECTED
  );

  // colours on the board; don't use middle track when 2 players
  var colours = ["DarkRed", "DarkGreen", "DarkBlue"];
  playerCount === 2 && colours.splice(1, 1);

  //// Return

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
        dealerPosition={0} // TEMP
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
        activePosition={[...game.toPlay][0]} // TEMP
        selectedCards={selected}
        clickCardHandler={(index) => dispatchSelected({ type: "click", index })} // TODO: only when clickable
      />
      <PlayArea
        hideEmptyColumns={HIDE_EMPTY_COLUMNS}
        deckSize={game.size}
        isDeckCut={game.isDeckCut}
        starter={game.starter}
        isStarterSelected={selected[6]}
        clickDeckHandler={() => dispatchSelected({ type: "click", index: 6 })} // TODO: only when clickable; allow click to cut or flip
        playStacks={game.piles} // TODO: rename to piles
      />
      <Actions
        waiting={false} // ={game.nextToAct !== position} TEMP
        // nextToAct={game.nextToAct !== null && players[game.nextToAct].name}
        nextAction={game.nextAction}
        labels={[
          "Deal",
          "To Crib",
          "Cut",
          "Flip",
          "Play",
          "Go",
          "Proceed",
          "Reset",
        ]} // TEMP
        actions={[
          game.deal,
          () => {
            game.sendToCrib(
              [...game.toPlay][0],
              selected
                .map((bool, index) => (bool ? index : null))
                .filter((index) => index !== null)
            );
            dispatchSelected({ type: "reset" });
          },
          game.cut,
          game.flip,
          () => {
            let index = selected.findIndex((bool) => bool);
            if (game.isValidPlay(index)) {
              game.play(index);
            } else {
              console.info("invalid play");
            }
            dispatchSelected({ type: "reset" });
          },
          () => {
            if (game.isValidGo()) {
              game.go();
            } else {
              console.info("invalid go");
            }
          },
          game.proceed,
          game.resetRound,
        ]} // TEMP: these need validation checks - correct player, stage, valid input
        enabled={Array(20).fill(true)} // TEMP
      />
      Round stage: player {game.toPlay} to {game.roundStage} // TEMP
      <PlayHistory messages={messages} />
      <Links
        gitHubLink="https://github.com/kr-matthews/cribbage"
        themeType="light"
      />
    </div>
  );
}

const messages = [
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

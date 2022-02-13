import { useState, useReducer } from "react";

import { useLocalStorage } from "./Hooks/useLocalStorage.js";
import { useGame } from "./Hooks/useGame.js";
import { useSoundEffects } from "./Hooks/useSoundEffects.js";
import { useGamePoints } from "./Hooks/useGamePoints.js";
// import { useNetwork } from "./Hooks/useNetwork.js"; // TEMP: uncomment for network

import Header from "./GameComponents/Header.js";
import Hands from "./GameComponents/Hands.js";
import PlayArea from "./GameComponents/PlayArea.js";
import Actions from "./GameComponents/Actions.js";
import ScoreBoard from "./GameComponents/ScoreBoard.js";
import PlayHistory from "./GameComponents/PlayHistory.js";
import Links from "./links/Links.js";

import "./GameComponents/gameComponents.css";
import "./PlayingCards/playingCards.css";

import Rank from "./PlayingCards/Rank.js"; // 2x TEMP: for PlayArea temp params
import Suit from "./PlayingCards/Suit.js";

//// Constants

// always use four columns
const HIDE_EMPTY_COLUMNS = false; // TODO: make empty cols uniform
// hand of size up to 6, plus starter card on the end
const HAND_ALL_UNSELECTED = Array(7).fill(0);

//// Reducers

function playersReducer(state, action) {
  const newState = [...state];
  switch (action.type) {
    case "add":
    // intentional fall-through
    // eslint-disable-next-line
    case "update":
      const ind = action.player;
      const isComputer = action.isComputer || newState[ind].isComputer;
      const name = action.name || newState[ind].name;
      const colour = action.colour || newState[ind].colour;
      newState[ind] = { isComputer, name, colour };
      break;
    case "remove":
      newState[action.player] = null;
      break;
    default:
      console.error("playersReducer couldn't recognize action", action);
  }
  return newState;
}

function selectedReducer(state, action) {
  const newState = [...state];
  switch (action.type) {
    case "click":
      newState[action.index] = !newState[action.index];
      break;
    case "reset":
      return HAND_ALL_UNSELECTED;
    default:
      console.error("selectedReducer couldn't recognize action", action);
  }
  return newState;
}

export default function App() {
  //// States

  // user's name (persists)
  const [userName, setUserName] = useLocalStorage("userName", "Your Name Here");
  // play mode: "local" or "remote"
  const [mode, setMode] = useState("local");
  // list of 3 players (players may be null)
  const [players, dispatchPlayers] = useReducer(playersReducer, [
    // TEMP players
    { name: "Joe", type: "Human" },
    { name: "You", type: "Human" },
    // { name: "Claire", type: "Computer" },
  ]);
  // what spot the user is 'sitting' in (can't be 'standing')
  const [position, setPosition] = useState(1);
  // amount of players present (user is always present)
  const playerCount = players.length;

  // the game
  const game = useGame();
  // track games, until player change
  // sound effects (can be muted)
  const soundEffects = useSoundEffects();
  // track game points across multiple games
  const gamePoints = useGamePoints();
  // handle network connection, for remote play
  // can still play locally if there's no connection
  const network = {}; // useNetwork({ capacityPerCode: 3 }); // TEMP: uncomment for network

  // which cards from user's name are selected
  // (may not be best as a boolean array; may want variable length of 5 or 6)
  const [selected, dispatchSelected] = useReducer(
    selectedReducer,
    HAND_ALL_UNSELECTED
  );

  // colours on the board; don't use middle row when 2 players
  var colours = ["DarkRed", "DarkGreen", "DarkBlue"];
  playerCount === 2 && colours.splice(1, 1);

  //// Return

  // TEMP: params for components
  return (
    // TEMP: WIP note
    <div className="app">
      This Cribbage project is a work-in-progress. Proper functionality is not
      guaranteed.
      <ScoreBoard
        gamePoints={gamePoints}
        currentScores={game.currentScores}
        priorScores={game.priorScores}
      />
      <Header
        hideEmptyColumns={HIDE_EMPTY_COLUMNS}
        userName={"Octavia"} //userName}
        updateUserName={() => console.log("Change name")} //setUserName}
        userPosition={1}
        dealerPosition={0}
        mode={"remote"} //mode}
        isSoundOn={false} //soundEffects.isOn}
        toggleSound={() => console.log("Toggle sound")} //soundEffects.toggle}
        code={"AB6Y"} //network.code}
        create={network.create}
        join={network.join}
        leave={network.leave}
        players={players}
        colours={colours}
        scores={[46, 67, 80]}
      />
      <Hands
        hideEmptyColumns={HIDE_EMPTY_COLUMNS}
        crib={stack2}
        hands={[stack1, stack2]}
        activePosition={0}
        selectedCards={selected}
        clickCardHandler={(index) => dispatchSelected({ type: "click", index })}
      />
      <PlayArea
        hideEmptyColumns={HIDE_EMPTY_COLUMNS}
        deckSize={52 - 13} //game.deckSize}
        isDeckCut={true && false}
        starter={{ rank: Rank.QUEEN, suit: Suit.DIAMOND, faceUp: true }} // game.starter}
        isStarterSelected={selected[6]}
        clickDeckHandler={() => dispatchSelected({ type: "click", index: 6 })} // sometimes this might cut or flip, not just select
        playStacks={[stack1, stack2]} // game.playStacks}
      />
      <Actions
        waiting={false} // ={game.nextToAct !== position}
        // nextToAct={game.nextToAct !== null && players[game.nextToAct].name}
        nextAction={game.nextAction}
        labels={["Accept Score", "Claim Missed Points"]}
        actions={[() => console.log("next action"), null]}
        enabled={[true, true]}
      />
      <PlayHistory messages={messages} />
      <Links
        gitHubLink="https://github.com/kr-matthews/cribbage"
        themeType="light"
      />
    </div>
  );
}

// TEMP: consts for temp params
const stack1 = [
  { rank: Rank.JACK, suit: Suit.SPADE, faceUp: true },
  { faceUp: false },
  { rank: Rank.ACE, suit: Suit.HEART, faceUp: true },
  { rank: Rank.EIGHT, suit: Suit.HEART, faceUp: true },
  { rank: Rank.ACE, suit: Suit.HEART, faceUp: false },
  { rank: Rank.TEN, suit: Suit.CLUB, faceUp: true },
];
const stack2 = [
  { rank: Rank.FOUR, suit: Suit.DIAMOND, faceUp: true },
  { rank: Rank.KING, suit: Suit.HEART, faceUp: true },
];
const stack3 = [];

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

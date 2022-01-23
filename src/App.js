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

import Rank from "./Cards/Rank.js"; // 2x TEMP: for PlayArea temp params
import Suit from "./Cards/Suit.js";

//// Constants

const HAND_ALL_UNSELECTED = [false, false, false, false, false, false];

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
      console.debug("playersReducer couldn't recognize action", action);
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

// TODO: NEXT: create all components (views), with temporary params

export default function App() {
  //// States

  // user's name (persists)
  const [userName, setUserName] = useLocalStorage("userName", "Your Name Here");
  // play mode: "local" or "remote"
  const [mode, setMode] = useState("local");
  // list of 3 players (players may be null)
  const [players, dispatchPlayers] = useReducer(
    [null, null, null],
    playersReducer
  );
  // what spot the user is 'sitting' in (can't be 'standing')
  const [position, setPosition] = useState(1);
  // amount of players present (user is always present)
  const playerCount = players[2] !== null ? 3 : players[1] !== null ? 2 : 1;

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
    HAND_ALL_UNSELECTED,
    selectedReducer
  );

  //// Return

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
        userName={userName}
        setUserName={setUserName}
        mode={mode}
        setMode={setMode}
        isSoundOn={soundEffects.isOn}
        toggleSound={soundEffects.toggle}
        code={network.code}
        create={network.create}
        join={network.join}
        leave={network.leave}
        players={players}
        dealer={game.dealer}
      />
      <Hands // TEMP: Hands params
        crib={game.crib}
        hands={game.hands}
        position={position}
        selectedCards={selected}
        amountOfCardsToSelect={null}
        clickCard={(index) => dispatchSelected({ type: "click", index })}
      />
      <PlayArea // TEMP: PlayArea params
        deckSize={52 - 13} //game.deckSize}
        isDeckCut={true && false}
        starter={{ rank: Rank.QUEEN, suit: Suit.DIAMOND, faceUp: true }} // game.starter}
        playStacks={[stack1, stack2, stack3]} // game.playStacks}
      />
      <Actions // TEMP: Actions params
        waiting={false} // ={game.nextToAct !== position}
        // nextToAct={game.nextToAct !== null && players[game.nextToAct].name}
        nextAction={game.nextAction}
        labels={["Accept Score", "Claim Missed Points"]}
        actions={[() => console.log("next action"), null]}
        enabled={[true, true]}
      />
      <PlayHistory // TEMP: PlayHistory param
        messages={[
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
        ]}
      />
      <Links
        gitHubLink="https://github.com/kr-matthews/cribbage"
        themeType="light"
      />
    </div>
  );
}

// TEMP: stacks
const stack1 = [
  { rank: Rank.JACK, suit: Suit.SPADE, faceUp: true },
  { rank: Rank.ACE, suit: Suit.CLUB, faceUp: true },
  { rank: Rank.TEN, suit: Suit.HEART, faceUp: true },
  { faceUp: false },
];
const stack2 = [
  { rank: Rank.JACK, suit: Suit.SPADE, faceUp: true },
  { rank: Rank.ACE, suit: Suit.CLUB, faceUp: true },
];
const stack3 = [];

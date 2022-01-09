import { useState, useReducer } from "react";

import { useLocalStorage } from "./Hooks/useLocalStorage.js";
import { useGame } from "./Hooks/useGame.js";
import { useSoundEffects } from "./Hooks/useSoundEffects.js";
import { useGamePoints } from "./Hooks/useGamePoints.js";
// import { useNetwork } from "./Hooks/useNetwork.js"; // TEMP: uncomment for network

import Header from "./Header/Header.js";
import Hands from "./Hands/Hands.js";
import PlayArea from "./PlayArea/PlayArea.js";
import ScoreBoard from "./ScoreBoard/ScoreBoard.js";
import PlayHistory from "./PlayHistory/PlayHistory.js";
import Links from "./links/Links.js";

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

// TODO: NEXT: create placeholdrs for all stateful values (here, useGame, etc.)

function App() {
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
  // what spot (0, 1, 2 -- or null) the user is 'sitting' in
  const [position, setPosition] = useState(null);
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
    <div className="App">
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
      <Hands
        crib={game.crib}
        hands={game.hands}
        position={position}
        selectedCards={selected}
        amountOfCardsToSelect={0} // TODO
        clickCard={(index) => dispatchSelected({ type: "click", index })}
      />
      <PlayArea
        deckSize={game.deckSize}
        starter={game.starter}
        playStacks={game.playStacks}
      />
      <ScoreBoard />
      <PlayHistory />

      <Links
        gitHubLink="https://github.com/kr-matthews/cribbage"
        themeType="light"
      />
    </div>
  );
}

export default App;

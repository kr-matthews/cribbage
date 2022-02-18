import { useState, useReducer } from "react";

import { useLocalStorage } from "./Hooks/useLocalStorage.js";
import { useGame } from "./Hooks/useGame.js";
import { useSoundEffects } from "./Hooks/useSoundEffects.js";
import { useGamePoints } from "./Hooks/useGamePoints.js";
import { useNetwork } from "./Hooks/useNetwork.js";

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
  const game = useGame();
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
        userName={userName}
        updateUserName={trySetUserName}
        userPosition={position}
        dealerPosition={0} // FIX
        mode={network.mode}
        isSoundOn={soundEffects.isOn}
        toggleSound={soundEffects.toggle}
        code={network.code}
        create={network.create}
        join={network.join}
        leave={network.leave}
        players={players}
        colours={colours}
        scores={[46, 67, 80]} // FIX
      />
      <Hands
        hideEmptyColumns={HIDE_EMPTY_COLUMNS}
        crib={crib} // FIX
        hands={[hand1, hand2]} // FIX
        activePosition={1} // FIX
        selectedCards={selected}
        clickCardHandler={(index) => dispatchSelected({ type: "click", index })} // TODO: only when clickable
      />
      <PlayArea
        hideEmptyColumns={HIDE_EMPTY_COLUMNS}
        deckSize={52 - 13} //game.deckSize}
        isDeckCut={false} //game.isDeckCut}
        starter={{ rank: Rank.QUEEN, suit: Suit.DIAMOND, faceUp: false }} //game.starter}
        isStarterSelected={selected[6]}
        clickDeckHandler={() => dispatchSelected({ type: "click", index: 6 })} // TODO: sometimes this might cut or flip, not just select
        playStacks={[stack1, stack2]} // game.playStacks}
      />
      <Actions
        waiting={false} // ={game.nextToAct !== position}
        // nextToAct={game.nextToAct !== null && players[game.nextToAct].name}
        nextAction={game.nextAction}
        labels={["Accept Score", "Claim Missed Points"]} // FIX
        actions={[() => console.log("next action"), null]} // FIX
        enabled={[true, true]} // FIX
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
const stack1 = [{ rank: Rank.THREE, suit: Suit.CLUB, faceUp: true }];
const stack2 = [
  { rank: Rank.FIVE, suit: Suit.CLUB, faceUp: true },
  { rank: Rank.JACK, suit: Suit.DIAMOND, faceUp: true },
];

const hand1 = [
  { rank: Rank.ACE, suit: Suit.HEART, faceUp: false },
  { rank: Rank.TWO, suit: Suit.DIAMOND, faceUp: false },
  { rank: Rank.TWO, suit: Suit.HEART, faceUp: false },
];
const hand2 = [
  { rank: Rank.FOUR, suit: Suit.SPADE, faceUp: true },
  { rank: Rank.KING, suit: Suit.HEART, faceUp: true },
];

const crib = [
  { faceUp: false },
  { faceUp: false },
  { faceUp: false },
  { faceUp: false },
];

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

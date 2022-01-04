import { useState } from "react";

import { useLocalStorage } from "./Hooks/useLocalStorage.js";
import { useGame } from "./Hooks/useGame.js";
import { useNetwork } from "./Hooks/useNetwork.js";

import Header from "./Header/Header.js";
import Hands from "./Hands/Hands.js";
import PlayArea from "./PlayArea/PlayArea.js";
import ScoreBoard from "./ScoreBoard/ScoreBoard.js";
import PlayHistory from "./PlayHistory/PlayHistory.js";
import Links from "./links/Links.js";

function App() {
  //// States

  // play mode: "local" or "remote"
  const [mode, setMode] = useState("local");
  // user
  const [userName, setUserName] = useLocalStorage("userName", "Your Name Here");

  //// Hooks
  const game = useGame();
  const network = useNetwork({ capacityPerCode: 3 });

  //// Return

  return (
    <div className="App">
      <Header />
      <Hands />
      <PlayArea />
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

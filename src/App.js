import { useState } from "react";

import { useLocalStorage } from "./Hooks/useLocalStorage.js";
import { useNetwork } from "./Hooks/useNetwork.js";

import SelectMode from "./SelectMode.js";
import Game from "./Game/Game.js";
import Links from "./links/Links.js";

function App() {
  //// States

  // play mode: "local" or "remote" (or null)
  const [mode, setMode] = useState(null);
  // user
  const [userName, setUserName] = useLocalStorage("userName", "Your Name Here");

  //// Hooks
  const network = useNetwork({ capacityPerCode: 3 });

  //// Return

  return (
    <div className="App">
      {mode ? (
        <Game mode={mode} />
      ) : (
        <SelectMode
          setMode={setMode}
          create={network.create}
          join={network.join}
        />
      )}

      <Links
        gitHubLink="https://github.com/kr-matthews/cribbage"
        themeType="light"
      />
    </div>
  );
}

export default App;

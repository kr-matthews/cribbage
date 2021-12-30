import { useState } from "react";

import { useNetwork } from "./Hooks/useNetwork.js";

import SelectMode from "./SelectMode.js";
import Links from "./links/Links.js";

function App() {
  //// States

  // play mode: "local" or "remote" (or null)
  const [mode, setMode] = useState(null);

  //// Hooks
  const network = useNetwork({ capacityPerCode: 3 });

  //// Return

  // TODO: NEXT: build out local play

  return (
    <div className="App">
      {mode ? (
        <></>
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

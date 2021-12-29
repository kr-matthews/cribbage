import { useState } from "react";

import SelectMode from "./SelectMode.js";
import Links from "./links/Links.js";

function App() {
  //// States

  // play mode: "local" or "remote" (or null)
  const [mode, setMode] = useState(null);
  // for remote play: 'room' code
  const [code, setCode] = useState(null);

  //// Return

  // TODO: NEXT: build out local play

  return (
    <div className="App">
      {mode ? <></> : <SelectMode setMode={setMode} setCode={setCode} />}
      <Links
        gitHubLink="https://github.com/kr-matthews/cribbage"
        themeType="light"
      />
    </div>
  );
}

export default App;

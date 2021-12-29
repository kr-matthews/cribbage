import { useState } from "react";

// TODO: CSS: (buttons, input)

export default function SelectMode({ setMode, setCode }) {
  const [selectedRemote, setSelectedRemote] = useState(false);
  const [selectedJoin, setSelectedJoin] = useState(false);
  const [codeInput, setCodeInput] = useState("");

  // TODO: NETWORK: generate code on create room

  function handleChange(e) {
    setCodeInput(e.target.value.toUpperCase().trim());
  }
  function handleSubmit(e) {
    e.preventDefault();
    if (codeInput === "") {
      // don't do anything if the input is empty
      return;
    }
    // TODO: NETWORK: verify code is valid on join room
    setCode(codeInput);
    setMode("remote");
  }

  return (
    <>
      <div>
        <button onClick={() => setMode("local")}>Play Locally</button>
        <button onClick={() => setSelectedRemote(true)}>Play Remotely</button>
      </div>
      {selectedRemote && (
        <div>
          <button onClick={() => setMode("remote")}>Create Game</button>
          <button onClick={() => setSelectedJoin(true)}>Join Game</button>
        </div>
      )}
      {selectedJoin && (
        <div>
          <form>
            <input
              type="text"
              placeholder="paste game code"
              value={codeInput}
              onChange={handleChange}
            ></input>
            <button onClick={handleSubmit}>Submit</button>
          </form>
        </div>
      )}
    </>
  );
}

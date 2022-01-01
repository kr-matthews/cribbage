import { useState } from "react";

// TODO: CSS: (buttons, input)

export default function SelectMode({ setMode, create, join }) {
  const [selectedRemote, setSelectedRemote] = useState(false);
  const [selectedJoin, setSelectedJoin] = useState(false);
  const [codeInput, setCodeInput] = useState("");

  function handleChange(e) {
    setCodeInput(e.target.value.toUpperCase().trim());
  }

  function handleJoin(e) {
    e.preventDefault();
    if (codeInput === "") {
      alert("Enter a code first!");
      return;
    }
    try {
      join(codeInput);
      setMode("remote");
    } catch (e) {
      // TODO: NETWORK: catch join error
    }
  }

  function handleCreate() {
    try {
      create();
      setMode("remote");
    } catch (e) {
      // TODO: NETWORK: catch create error
    }
  }

  return (
    <>
      <div>
        <button onClick={() => setMode("local")}>Play Locally</button>
        <button onClick={() => setSelectedRemote(true)}>Play Remotely</button>
      </div>
      {selectedRemote && (
        <div>
          <button onClick={handleCreate}>Create Game</button>
          <button onClick={() => setSelectedJoin(true)}>Join Game</button>
        </div>
      )}
      {selectedJoin && (
        <div>
          <form>
            <input
              type="text"
              placeholder="paste or type code"
              value={codeInput}
              onChange={handleChange}
            ></input>
            <button onClick={handleJoin}>Submit</button>
          </form>
        </div>
      )}
    </>
  );
}

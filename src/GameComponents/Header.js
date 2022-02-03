const COLOURS = ["DarkRed", "DarkGreen", "DarkBlue"];

export default function Header({
  userName,
  setUserName,
  userPosition,
  dealerPosition,
  mode,
  setMode,
  isSoundOn,
  toggleSound,
  code,
  create,
  join,
  leave,
  players,
  scores,
}) {
  return (
    <div className="game-component">
      <Options userName={userName} setUserName={setUserName} />
      {[0, 1, 2].map((index) => {
        // TODO: NEXT: NEXT: deal with only having 1 or 2 players
        return (
          <InfoBox
            key={index}
            exists={players[index] !== null}
            isUser={index === userPosition}
            isDealer={index === dealerPosition}
            name={players[index].name}
            type={players[index].type}
            colour={COLOURS[index]} // TODO: omit green for 2 players
            score={scores[index]}
          />
        );
      })}
    </div>
  );
}

function InfoBox({
  exists,
  isUser,
  isDealer,
  name,
  type,
  colour = "DarkGrey",
  score = "--",
}) {
  const style = {
    backgroundColor: colour,
    borderColor: isDealer ? "Black" : "transparent",
  };

  return (
    <div className="col headerbox infobox" style={exists ? style : {}}>
      {exists && (
        <>
          <div className="headerbox-info">{name || "(no name)"}</div>
          <div className="headerbox-info">{type || "(unknown)"}</div>
          <div className="headerbox-info">
            Score: {score !== null ? score : "--"}
          </div>
        </>
      )}
    </div>
  );
}

// TODO: NEXT: NEXT: finish Options

// TODO: allow input to change username
function Options({ userName, setUserName, isSoundOn, toggleSound }) {
  return (
    <div className="col headerbox options">
      <div className="headerbox-info">
        Name: <button onClick={setUserName}>{userName}</button>
      </div>
      <div className="headerbox-info">
        Sound is{" "}
        <button onClick={toggleSound}>{isSoundOn ? "on" : "off"}</button>
      </div>
    </div>
  );
}

// TODO: NEXT: SHOWING_EMPTY_SPOTS clean up and share with other components
const SHOWING_EMPTY_SPOTS = false;

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
  players = [],
  scores,
}) {
  const dummyArray = SHOWING_EMPTY_SPOTS
    ? Array(3 - players.length).fill(0)
    : [];

  // TODO: COLOURS: clean up and share with other components
  var colours = ["DarkRed", "DarkGreen", "DarkBlue"];
  // for 2 players, use the outer and inner tracks (skip middle green)
  players.length === 2 && colours.splice(1, 1);

  return (
    <div className="game-component">
      <Options userName={userName} setUserName={setUserName} />
      {players.map(({ name, type }, index) => {
        return (
          <InfoBox
            key={index}
            exists={true}
            isUser={index === userPosition}
            isDealer={index === dealerPosition}
            name={name}
            type={type}
            colour={colours[index]}
            score={scores[index]}
          />
        );
      })}
      {dummyArray.map((_, index) => {
        console.log("fake", index);
        return <InfoBox key={players.length + index} exists={false} />;
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
  colour = "transparent",
  score = "--",
}) {
  const style = {
    backgroundColor: colour,
    borderColor: isDealer ? "Black" : "transparent",
  };

  return (
    <div className="col headerbox infobox" style={style}>
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

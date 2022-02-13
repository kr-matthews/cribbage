import Options from "../Options/Options.js";

export default function Header({
  hideEmptyColumns,
  userName,
  updateUserName,
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
  colours,
}) {
  const dummyArray = hideEmptyColumns ? [] : Array(3 - players.length).fill(0);

  return (
    <div className="game-component">
      <Options
        userName={userName}
        updateUserName={updateUserName}
        isSoundOn={isSoundOn}
        toggleSound={toggleSound}
        mode={mode}
        setMode={setMode}
        code={code}
        create={create}
        join={join}
        leave={leave}
      />
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

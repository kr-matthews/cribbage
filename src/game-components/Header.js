import Options from "../options/Options.js";

export default function Header({
  hideEmptyColumns,
  userName,
  updateUserName,
  userPosition,
  dealerPosition,
  mode = "local",
  isSoundOn = false,
  toggleSound,
  code,
  create,
  join,
  leave,
  players = [],
  nextPlayers = [false, false, false],
  scores = [null, null, null],
  colours = [null, null, null],
  removeable,
  removePlayer,
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
        code={code}
        create={create}
        join={join}
        leave={leave}
      />
      {players.map(({ name, isComputer }, index) => {
        return (
          <InfoBox
            key={index}
            exists={true}
            isUser={index === userPosition}
            isDealer={index === dealerPosition}
            isNextPlayer={nextPlayers[index]}
            clickable={removeable && removeable[index]}
            onClick={() => removePlayer(index)}
            onHover={"Click to remove this player"}
            name={name}
            type={isComputer ? "Computer" : "Human"}
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
  isNextPlayer,
  clickable,
  onClick,
  onHover,
  name = "name unknown",
  type = "agency unknown",
  colour = "transparent",
  score,
}) {
  const style = {
    backgroundColor: colour,
    borderColor: isNextPlayer ? "#E41B17" : "transparent",
  };
  const className = `col headerbox infobox${clickable ? " clickable" : ""}`;

  return (
    <div
      className={className}
      onClick={clickable ? onClick : null}
      title={clickable ? onHover : ""}
      style={style}
    >
      {exists && (
        <>
          <div className="headerbox-info">
            {isDealer && "*"}
            {/* TODO: NEXT: add icon to represent dealer */}
            {isUser ? <em>{name}</em> : name}
          </div>
          <div className="headerbox-info">{type}</div>
          <div className="headerbox-info">
            Score: {score !== null ? score : "--"}
          </div>
        </>
      )}
    </div>
  );
}

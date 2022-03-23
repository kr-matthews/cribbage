import Options from "../options/Options.js";

export default function Header({
  hideEmptyColumns = true,
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
  canAddPlayer,
  addPlayer,
  players = [],
  nextPlayers = [false, false, false],
  scores = [null, null, null],
  colours = [null, null, null],
  removeable,
  removePlayer,
}) {
  const dummyArray = hideEmptyColumns
    ? []
    : Array(3 - players.length - (canAddPlayer ? 1 : 0)).fill(0);

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
            clickableType={removeable && removeable[index] && "removeable"}
            onClick={() => removePlayer(index)}
            tooltip={"Click to remove this player"}
            name={name}
            type={isComputer ? "Computer" : "Human"}
            colour={colours[index]}
            score={scores[index]}
          />
        );
      })}
      {canAddPlayer && (
        <InfoBox
          exists={true}
          clickableType={"addable"}
          onClick={addPlayer}
          tooltip={"Click to add a computer player"}
          colour={"DarkGrey"}
        />
      )}
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
  clickableType,
  onClick,
  tooltip,
  name,
  type,
  colour = "transparent",
  score,
}) {
  const clickable = !!clickableType;
  const colours = {
    backgroundColor: colour,
    borderColor: isNextPlayer ? "#E41B17" : "transparent",
  };
  const classes = `col headerbox infobox${
    clickable ? ` ${clickableType}` : ""
  }`;

  return (
    <div
      className={classes}
      onClick={clickable ? onClick : null}
      title={clickable ? tooltip : ""}
      style={colours}
    >
      {clickableType === "addable" ? (
        <div className="plus">+</div>
      ) : (
        exists && (
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
        )
      )}
    </div>
  );
}

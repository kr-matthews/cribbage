import PlayMode from "./PlayMode.js";
import Edit from "./Edit.js";

export default function Options({
  userName,
  updateUserName,
  isSoundOn,
  toggleSound,
  mode,
  code,
  create,
  join,
  leave,
  pointsToWin,
}) {
  return (
    <div className="col headerbox options">
      <div className="headerbox-info">
        Name: {userName}{" "}
        <Edit
          type="prompt"
          text="Enter a new username:"
          defaultInput={userName}
          fun={updateUserName}
        />
      </div>
      <div className="headerbox-info">
        Sound: {isSoundOn ? "On" : "Off"} <Edit fun={toggleSound} />
      </div>
      <PlayMode
        mode={mode}
        code={code}
        create={create}
        join={join}
        leave={leave}
      />
      {pointsToWin !== null && (
        <div className="headerbox-info">First to {pointsToWin} Game Points</div>
      )}
    </div>
  );
}

// todo: GAME POINTS: allow changing pointsToWin here

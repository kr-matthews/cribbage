import PlayMode from "./PlayMode.js";

// TODO: NEXT: NEXT: finish Options

// TODO: allow input to change username
export default function Options({
  userName,
  setUserName,
  isSoundOn,
  toggleSound,
  mode,
  setMode,
  code,
  create,
  join,
  leave,
}) {
  return (
    <div className="col headerbox options">
      <div className="headerbox-info">
        Name: <button onClick={setUserName}>{userName}</button>
      </div>
      <div className="headerbox-info">
        Sound: <button onClick={toggleSound}>{isSoundOn ? "on" : "off"}</button>
      </div>
      <PlayMode />
    </div>
  );
}

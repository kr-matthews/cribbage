import Edit from "./Edit.js";

export default function PlayMode({
  mode = "local",
  code,
  create,
  join,
  leave,
}) {
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    alert(`Remote code ${code} copied to clipboard.`);
  };

  function playRemoteHandler(code) {
    code ? join(code) : create();
  }

  return (
    <>
      <div className="headerbox-info">
        {mode === "local" ? (
          <>
            Playing Locally{" "}
            <Edit
              type="prompt"
              text={`To join an existing remote game, get the code from a player and enter it here.\n\nOr, to create a new remote game, leave this blank. You'll be given a new code which you can share.`}
              fun={playRemoteHandler}
            />
          </>
        ) : mode === "connecting" ? (
          <>Connecting...</>
        ) : (
          <>
            Remote Code:{" "}
            <button className="copy-code" onClick={copyToClipboard}>
              {code}
            </button>{" "}
            <Edit
              type="confirm"
              text="Are you sure you want to leave this remote game? Any match history and game state will be lost for everyone - not just yourself."
              fun={leave}
            />
          </>
        )}
      </div>
    </>
  );
}

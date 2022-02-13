import Edit from "./Edit.js";

export default function PlayMode({
  mode = "local",
  setMode, // TODO: NEXT: NEXT: confirm where to use this (and use copyTo...)
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
            Playing: Locally{" "}
            <Edit
              type="prompt"
              text="Enter a valid remote code to join it, or leave blank to create your own:"
              fun={playRemoteHandler}
            />
          </>
        ) : (
          <>
            Remote Code: {code}{" "}
            <Edit
              type="confirm"
              text="Are you sure you want to leave this remote game? The game state may be lost."
              fun={leave}
            />
          </>
        )}
      </div>
    </>
  );
}

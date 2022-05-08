export default function Actions({
  waiting = true,
  nextToAct = "opponent",
  nextAction = "act",
  labels = [],
  actions = [],
  enabled = [],
}) {
  let buttons = [];
  for (var i = 0; i < labels.length; i++) {
    buttons.push(
      <Button
        key={i}
        label={labels[i]}
        action={actions[i]}
        enabled={enabled[i]}
      />
    );
  }
  const waitingMessage = "Waiting for " + nextToAct + " to " + nextAction + ".";
  // ~ should just be 1 div with {waiting ? waitingMessage : buttons}
  return (
    <>
      <div className="game-component actions">{waitingMessage}</div>
      <div className="game-component actions">{buttons}</div>
    </>
  );
}

function Button({ label, action, enabled }) {
  return (
    <button className="action" disabled={!enabled} onClick={action}>
      {label}
    </button>
  );
}

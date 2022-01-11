import "./playHistory.css";

export default function PlayHistory({ messages = [] }) {
  let messageDisplays = [];
  messages.forEach(({ type, colour, text, timestamp }) => {
    messageDisplays.push(
      <Message
        key={timestamp}
        type={type}
        colour={colour}
        text={text}
        timestamp={timestamp}
      />
    );
  });

  return <div className="game-component play-history">{messageDisplays}</div>;
}

function Message({
  type = "auto",
  colour = "black",
  text = "Unknown message",
  timestamp,
}) {
  const time = new Date(timestamp).toLocaleTimeString("en-CA", {
    hour12: false,
  });
  return (
    <div className="message">
      {type === "custom" ? <strong>{time}</strong> : time}
      {" -> "}
      <span style={{ color: colour }}>{text}</span>
    </div>
  );
}

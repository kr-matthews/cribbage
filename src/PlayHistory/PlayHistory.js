export default function PlayHistory({ messages = [] }) {
  let messageDisplays = [];
  messages.forEach(({ type, colour, text, timestamp }, i) => {
    messageDisplays.unshift(
      <Message
        key={timestamp}
        type={type}
        colour={colour}
        text={text}
        timestamp={timestamp}
        highlight={i === messages.length - 1}
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
  highlight = false,
}) {
  const time = new Date(timestamp).toLocaleTimeString("en-CA", {
    hour12: false,
  });
  return (
    <div className="message">
      {time}
      {" - "}
      <span style={{ color: colour }}>
        {highlight ? (
          <strong>{type === "manual" ? <em>{text}</em> : text}</strong>
        ) : type === "manual" ? (
          <em>{text}</em>
        ) : (
          text
        )}
      </span>
    </div>
  );
}

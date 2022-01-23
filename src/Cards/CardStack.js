import Card from "./Card.js";

// in px
const H_SPACING = 1;
const V_SPACING = 1 / 2;

export default function CardStack({
  size = 52,
  topCard,
  vOffset = 0,
  hOffset = 0,
}) {
  const { rank, suit, faceUp } = topCard || { faceUp: false };

  function container(i) {
    return {
      position: "relative",
      top: `${i * V_SPACING + vOffset}px`,
      left: `-${i * (66 - H_SPACING) + hOffset}px`,
    };
  }

  let stack = [];

  // add the non-top cards
  for (var i = 0; i < size - 1; i++) {
    stack.push(
      <div key={i} style={container(i)}>
        <Card faceUp={false} />
      </div>
    );
  }

  // add the top card
  stack.push(
    <div key={-1} style={container(size - 1)}>
      <Card rank={rank} suit={suit} faceUp={faceUp} />
    </div>
  );

  return (
    <div
      className="stack"
      style={{
        width: "calc(var(--card-width) * 2)",
        border: "dotted 1px Black",
      }} // TEMP
    >
      {stack}
    </div>
  );
}

import Card from "./Card.js";

// in px
const H_SPACING = 1;
const V_SPACING = 1 / 2;

export default function CardStack({ size = 52, topCard }) {
  const { rank, suit, faceUp } = topCard || { faceUp: false };

  function cardContainerStyle(i) {
    return {
      position: "relative",
      top: `calc(var(--stack-vert-spacing) * ${i})`,
      left: `calc((var(--stack-hori-spacing) - var(--card-width) - (2 * var(--border-width))) * ${i})`,
    };
  }

  const height = `calc(var(--card-height) + (2 * var(--border-width)) + (var(--stack-vert-spacing) * ${
    size - 1
  }))`;
  const width = `calc(var(--card-width) + (2 * var(--border-width)) + (var(--stack-hori-spacing) * ${
    size - 1
  }))`;

  let stack = [];

  // add the non-top cards
  for (var i = 0; i < size - 1; i++) {
    stack.push(
      <div key={i} style={cardContainerStyle(i)}>
        <Card faceUp={false} />
      </div>
    );
  }

  // add the top card
  stack.push(
    <div key={size - 1} style={cardContainerStyle(size - 1)}>
      <Card rank={rank} suit={suit} faceUp={faceUp} />
    </div>
  );

  return (
    <div className="stack" style={{ width, height }}>
      {stack}
    </div>
  );
}

import Card from "./Card.js";

// either uses given cards, or creates hand of given size
export default function Hand({
  cards,
  size,
  isSelected,
  clickHandler,
  maxSize,
}) {
  function cardContainerStyle(i) {
    return {
      position: "relative",
      left: `calc((var(--hand-spacing) - var(--card-width) - (2 * var(--border-width))) * ${i})`,
    };
  }

  const handSize = size || cards.length;
  const width = `calc(var(--card-width) + (2 * var(--border-width)) + (var(--hand-spacing) * ${Math.max(
    0,
    (maxSize || handSize) - 1
  )}))`;

  // if no explicit cards given, create face-down cards
  let hand = cards || Array(handSize).fill({ faceUp: false });

  // transform into stack of Card components
  hand = hand.map(({ rank, suit, faceUp }, index) => {
    return (
      <div key={index} style={cardContainerStyle(index)}>
        <Card
          rank={rank}
          suit={suit}
          faceUp={faceUp}
          isSelected={isSelected ? isSelected[index] : false}
          clickHandler={clickHandler ? () => clickHandler(index) : null}
        />
      </div>
    );
  });

  return (
    <div className="hand" style={{ width }}>
      {hand}
    </div>
  );
}

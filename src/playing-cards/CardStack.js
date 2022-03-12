import Card from "./Card.js";

/**
 * Provide either the cards themselves, or the amount of cards and the top card.
 * Also whether the top card is selected, and a click handler for it.
 *
 * @param {Object} param0
 * @returns Deck View.
 */
export default function CardStack({
  cards,
  size,
  topCard,
  isTopSelected,
  clickTopHandler,
  maxSize,
  thinStack = false,
}) {
  function cardContainerStyle(i) {
    return {
      position: "relative",
      top: `calc(var(--stack-vert-spacing) * ${i})`,
      left: `calc((var(--stack-hori-spacing${
        thinStack ? "-thin" : ""
      }) - var(--card-width) - (2 * var(--border-width))) * ${i})`,
    };
  }

  const stackSize = size || cards.length;
  const height = `calc(var(--card-height) + (2 * var(--border-width)) + (var(--stack-vert-spacing) * ${Math.max(
    0,
    (maxSize || stackSize) - 1
  )}))`;
  const width = `calc(var(--card-width) + (2 * var(--border-width)) + (var(--stack-hori-spacing${
    thinStack ? "-thin" : ""
  }) * ${Math.max(0, (maxSize || stackSize) - 1)}))`;

  // if no explicit cards given, create face-down cards
  let cardStack = cards || Array(stackSize - 1).fill({ faceUp: false });
  cards || cardStack.push(topCard || { faceUp: false });

  // transform into stack of Card components
  cardStack = cardStack.map(({ rank, suit, faceUp }, index) => {
    return (
      <div key={index} style={cardContainerStyle(index)}>
        {index === size - 1 ? (
          <Card
            rank={rank}
            suit={suit}
            faceUp={faceUp}
            isSelected={isTopSelected}
            clickHandler={clickTopHandler}
          />
        ) : (
          <Card rank={rank} suit={suit} faceUp={faceUp} />
        )}
      </div>
    );
  });

  return (
    <div className="stack" style={{ width, height }}>
      {cardStack}
    </div>
  );
}

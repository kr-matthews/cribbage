import CardStack from "./CardStack.js";

/**
 * Provide either the cards themselves or the amount of cards, plus the starter,
 * its selected state, and its click handler.
 *
 * @param {Object} param0
 * @returns Deck View.
 */
export default function Deck({
  cards,
  size,
  starter,
  isStarterSelected,
  clickTopHandler,
}) {
  return (
    <div className="deck">
      <CardStack
        cards={cards}
        size={size}
        topCard={starter}
        isTopSelected={isStarterSelected}
        clickTopHandler={clickTopHandler}
        maxSize={52}
        thinStack={true}
      />
    </div>
  );
}

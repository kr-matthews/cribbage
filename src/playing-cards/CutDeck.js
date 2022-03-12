import CardStack from "./CardStack.js";

/**
 * Provide either the cards themselves or the amount of cards, plus a
 * click handler for the un-cut portion of the deck.
 *
 * @param {Object} param0
 * @returns Deck View.
 */
export default function CutDeck({
  bottomCards,
  topCards,
  bottomSize,
  topSize,
  clickDeckHandler,
}) {
  return (
    <div className="deck">
      <CardStack
        cards={bottomCards}
        size={bottomSize}
        clickTopHandler={clickDeckHandler}
        thinStack={true}
      />
      <CardStack cards={topCards} size={topSize} thinStack={true} />
    </div>
  );
}

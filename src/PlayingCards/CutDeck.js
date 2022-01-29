import CardStack from "./CardStack.js";

// simulate stacked cards by stacking /4 of them
// also need to change PlayArea size in css
const SCALE_DOWN_FACTOR = 4;

// kind of assumes there are enough cards to make a reasonable cut
export default function CutDeck({ size = 52, clickDeckHandler }) {
  const simulatedSize = Math.ceil(size / SCALE_DOWN_FACTOR);
  // split with at least 2 'visible' cards per hand (if possible)
  const minSize = simulatedSize > 3 ? 2 : simulatedSize > 1 ? 1 : 0;
  const sizeTop =
    minSize + Math.floor(Math.random() * (simulatedSize - 2 * minSize + 1));
  const sizeBottom = simulatedSize - sizeTop;

  return (
    <div className="deck">
      <CardStack size={sizeBottom} clickTopHandler={clickDeckHandler} />
      <CardStack size={sizeTop} />
    </div>
  );
}

import CardStack from "./CardStack.js";

// simulate stacked cards by stacking /4 of them
const SCALE_DOWN_FACTOR = 4;

// kind of assumes there are enough cards to make a reasonable cut
export default function CutDeck({ size = 52 }) {
  const simulatedSize = Math.ceil(size / SCALE_DOWN_FACTOR);
  // split with at least 2 'visible' cards per hand
  const sizeTop = 2 + Math.floor(Math.random() * (simulatedSize - 4));
  const sizeBottom = simulatedSize - sizeTop;

  return (
    <div className="deck">
      <CardStack size={sizeBottom} />
      <CardStack size={sizeTop} vOffset={sizeBottom / 2} hOffset={70} />
    </div>
  );
}

// TODO: CSS: move awkward offsets into css files

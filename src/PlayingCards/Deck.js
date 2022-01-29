import CardStack from "./CardStack.js";

// simulate stacked cards by stacking /4 of them
const SCALE_DOWN_FACTOR = 4;

export default function Deck({
  size = 52,
  starter,
  isStarterSelected,
  clickTopHandler,
}) {
  const simulatedSize = Math.ceil(size / SCALE_DOWN_FACTOR);
  return (
    <div className="deck">
      <CardStack
        size={simulatedSize}
        topCard={starter}
        isTopSelected={isStarterSelected}
        clickTopHandler={clickTopHandler}
      />
    </div>
  );
}

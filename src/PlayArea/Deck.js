import Card from "./../Cards/Card.js";

import Suit from "./../Cards/Suit.js";
import Rank from "./../Cards/Rank.js";

import "./deck.css";

// TODO: CSS: deal with cut deck case

export default function Deck({ deckSize = 52, isDeckCut = false, starter }) {
  // split with at least 1 card per hand
  const splitRatio = 1 + Math.floor(Math.random() * (deckSize - 2));

  // simulate stacked cards by stacking /4 of them
  const simulatedSize = deckSize / 4;
  let deck = [];
  // add the non-top cards
  for (var i = 0; i < simulatedSize - 1; i++) {
    deck.push(
      <div key={i} style={getStyle(i)}>
        <Card faceUp={false} />
      </div>
    );
  }
  // with starter card on top, if applicable
  deck.push(
    <div key={-1} style={getStyle(Math.ceil(simulatedSize - 1))}>
      {starter || <Card faceUp={false} />}
    </div>
  );
  return <div className="deck">{deck}</div>;
}

// TODO: NEXT: then Deck.js, then PlayArea.js

function getStyle(i) {
  return {
    position: "relative",
    top: `${i / 2}px`,
    left: `-${i * 65}px`,
  };
}

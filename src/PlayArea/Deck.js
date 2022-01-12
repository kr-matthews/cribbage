import Card from "./../Card.js";

export default function Deck({ deckSize = 52, isDeckCut = false, starter }) {
  return (
    <div>
      Deck: <Card rank={"A"} suit={"Clubs"} />
    </div>
  );
}

// TODO: NEXT: Card.js, then Deck.js, then PlayArea.js

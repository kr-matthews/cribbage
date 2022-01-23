import Deck from "../Cards/Deck.js";
import CutDeck from "../Cards/CutDeck.js";

export default function PlayArea({ deckSize, isDeckCut, starter, playStacks }) {
  return (
    <div className="game-component play-area">
      <div className="col">
        {isDeckCut ? (
          <CutDeck size={deckSize} />
        ) : (
          <Deck size={deckSize} starter={starter} />
        )}
      </div>
    </div>
  );
}

// TODO: NEXT: NEXT: Hands.js -> individual play areas
// TODO: NEXT: starter card is selectable

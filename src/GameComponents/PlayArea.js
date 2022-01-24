import Deck from "../PlayingCards/Deck.js";
import CutDeck from "../PlayingCards/CutDeck.js";

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

// TODO: NEXT: NEXT: starter card is selectable
// TODO: NEXT: NEXT: Hands.js -> individual play areas

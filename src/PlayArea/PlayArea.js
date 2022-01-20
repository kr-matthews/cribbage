import Deck from "../Cards/Deck.js";
import CutDeck from "../Cards/CutDeck.js";

export default function PlayArea({ deckSize, isDeckCut, starter, playStacks }) {
  return (
    <div className="game-component">
      {isDeckCut ? (
        <CutDeck deckSize={deckSize} />
      ) : (
        <Deck deckSize={deckSize} starter={starter} />
      )}
    </div>
  );
}

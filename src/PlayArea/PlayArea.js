import Deck from "./Deck.js";

export default function PlayArea({ deckSize, isDeckCut, starter, playStacks }) {
  return (
    <div className="game-component">
      <Deck deckSize={deckSize} isDeckCut={isDeckCut} starter={starter} />
    </div>
  );
}

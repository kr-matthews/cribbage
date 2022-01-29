import Deck from "../PlayingCards/Deck.js";
import CutDeck from "../PlayingCards/CutDeck.js";

export default function PlayArea({
  deckSize,
  isDeckCut,
  starter,
  playStacks,
  isStarterSelected,
  clickDeckHandler,
}) {
  return (
    <div className="game-component play-area">
      <div className="col">
        {isDeckCut ? (
          <CutDeck size={deckSize} clickDeckHandler={clickDeckHandler} />
        ) : (
          <Deck
            size={deckSize}
            starter={starter}
            isStarterSelected={isStarterSelected}
            clickTopHandler={clickDeckHandler}
          />
        )}
      </div>
      <div className="col">
        <CutDeck size={44} />
      </div>
      <div className="col">
        <CutDeck size={9} />
      </div>
      <div className="col">
        <CutDeck size={17} />
      </div>
    </div>
  );
}

// TODO: NEXT: NEXT: Hands.js -> individual play areas

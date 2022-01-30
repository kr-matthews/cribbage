import Deck from "../PlayingCards/Deck.js";
import CutDeck from "../PlayingCards/CutDeck.js";
import CardStack from "../PlayingCards/CardStack.js";

export default function PlayArea({
  deckSize,
  isDeckCut,
  starter,
  isStarterSelected,
  clickDeckHandler,
  playStacks,
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
      {playStacks.map((cards, index) => {
        return (
          <div key={index} className="col">
            <CardStack cards={cards} />
          </div>
        );
      })}
    </div>
  );
}
import Deck from "../playing-cards/Deck.js";
import CutDeck from "../playing-cards/CutDeck.js";
import CardStack from "../playing-cards/CardStack.js";

export default function PlayArea({
  hideEmptyColumns,
  deckSize,
  deckBottomSize,
  deckTopSize,
  isDeckCut,
  starter,
  isStarterSelected,
  clickDeckHandler,
  playStacks = [],
}) {
  const dummyArray = hideEmptyColumns
    ? []
    : Array(3 - playStacks.length).fill(0);

  return (
    <div className="game-component play-area">
      <div className="col">
        {isDeckCut ? (
          <CutDeck
            bottomSize={deckBottomSize}
            topSize={deckTopSize}
            clickDeckHandler={clickDeckHandler}
          />
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
            <CardStack cards={cards} maxSize={4} />
          </div>
        );
      })}
      {dummyArray.map((_, index) => {
        return <div key={playStacks.length + index} className="col"></div>;
      })}
    </div>
  );
}

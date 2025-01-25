import Deck from "../playing-cards/Deck.js";
import CutDeck from "../playing-cards/CutDeck.js";
import Hand from "../playing-cards/Hand.js";

export default function PlayArea({
  hideEmptyColumns,
  deckSize,
  isDeckCutInPlace,
  deckBottomSize,
  deckTopSize,
  starter,
  isStarterSelected,
  clickDeckHandler,
  piles = [],
  cutSizes,
  cutCards,
}) {
  const dummyArray = hideEmptyColumns ? [] : Array(4 - piles.length).fill(0);

  return (
    <div className="game-component play-area">
      <div className="col">
        {isDeckCutInPlace ? (
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
      {piles.map((cards, index) => {
        return cutCards[index] ? (
          <div key={index} className="col">
            <Deck size={cutSizes[index]} starter={cutCards[index]} />
          </div>
        ) : (
          <div key={index} className="col">
            <Hand cards={cards} maxSize={4} />
          </div>
        );
      })}
      {dummyArray.map((_, index) => {
        return <div key={piles.length + index} className="col"></div>;
      })}
    </div>
  );
}

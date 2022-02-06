import Hand from "../PlayingCards/Hand.js";

export default function Hands({
  hideEmptyColumns,
  crib,
  hands = [],
  activePosition,
  selectedCards,
  clickCardHandler,
}) {
  const dummyArray = hideEmptyColumns ? [] : Array(3 - hands.length).fill(0);

  return (
    <div className="game-component">
      <div className="col">
        <Hand
          cards={crib}
          isSelected={-1 === activePosition && selectedCards}
          clickHandler={-1 === activePosition && clickCardHandler}
        />
      </div>
      {hands.map((cards, index) => (
        <div key={index} className="col">
          <Hand
            cards={cards}
            isSelected={index === activePosition && selectedCards}
            clickHandler={index === activePosition && clickCardHandler}
          />
        </div>
      ))}
      {dummyArray.map((_, index) => {
        return <div key={hands.length + index} className="col"></div>;
      })}
    </div>
  );
}

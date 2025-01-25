import Hand from "../playing-cards/Hand.js";

export default function Hands({
  hideEmptyColumns,
  crib,
  hands = [],
  activePosition,
  selectedCards,
  clickCardHandler,
  maxSize,
}) {
  const dummyArray = hideEmptyColumns ? [] : Array(4 - hands.length).fill(0);

  return (
    <div className="game-component">
      <div className="col">
        <Hand
          cards={crib}
          isSelected={-1 === activePosition && selectedCards}
          clickHandler={-1 === activePosition && clickCardHandler}
          maxSize={4}
        />
      </div>
      {hands.map((cards, index) => (
        <div key={index} className="col">
          <Hand
            cards={cards}
            isSelected={index === activePosition && selectedCards}
            clickHandler={index === activePosition && clickCardHandler}
            maxSize={maxSize}
          />
        </div>
      ))}
      {dummyArray.map((_, index) => {
        return <div key={hands.length + index} className="col"></div>;
      })}
    </div>
  );
}

import Hand from "../PlayingCards/Hand.js";

export default function Hands({
  crib,
  hands,
  activePosition,
  selectedCards,
  clickCardHandler,
}) {
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
    </div>
  );
}

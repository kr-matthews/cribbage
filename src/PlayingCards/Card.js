import Suit from "./Suit.js";

import playingCardBack from "./images/playing_card_back.svg";

const backgroundImage = `url(${playingCardBack})`;

export default function Card({
  rank,
  suit,
  faceUp = false,
  isSelected = false,
  clickHandler = null,
}) {
  const faceClass = faceUp ? " face-up" : " face-down";
  const selectedClass = isSelected ? " selected" : " not-selected";
  const clickableClass = clickHandler ? " clickable" : "";
  const colourClass =
    faceUp && (suit === Suit.HEART || suit === Suit.DIAMOND)
      ? " red-suit"
      : faceUp && (suit === Suit.SPADE || suit === Suit.CLUB)
      ? " black-suit"
      : "";

  const className = `card${faceClass}${selectedClass}${colourClass}${clickableClass}`;
  const backImageIfFaceDown = faceUp ? {} : { backgroundImage };

  return (
    <div
      className={className}
      style={backImageIfFaceDown}
      onClick={() => clickHandler && clickHandler()}
    >
      {faceUp && (
        <>
          <div className="card-info">{rank.symbol}</div>
          <div className="card-info">
            <img src={suit.image} alt={suit.name} />
          </div>
        </>
      )}
    </div>
  );
}

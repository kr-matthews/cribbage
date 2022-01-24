import Suit from "./Suit.js";

import playingCardBack from "./images/playing_card_back.svg";

const backgroundImage = `url(${playingCardBack})`;

const DEFAULT_COLOUR = "White";
const SELECTED_COLOUR = "LightGrey";

const DEFAULT_BORDER = "#0b2652"; // attempt to match background picture
const SELECTED_BORDER = "Red";

// attempt to match suit image colours
const RED_SUIT = "#85221b";
const BLACK_SUIT = "Black";

export default function Card({ rank, suit, faceUp = false, selected = false }) {
  const borderColor = selected ? SELECTED_BORDER : DEFAULT_BORDER;
  const backgroundColor = selected ? SELECTED_COLOUR : DEFAULT_COLOUR;
  const color =
    suit === Suit.HEART || suit === Suit.DIAMOND ? RED_SUIT : BLACK_SUIT;

  const cardStyle = faceUp
    ? { borderColor, backgroundColor }
    : { borderColor, backgroundImage };

  return (
    <div className="card" style={cardStyle}>
      {faceUp ? (
        <>
          <div className="card-info" style={{ color }}>
            {rank.symbol}
          </div>
          <div className="card-info">
            <img src={suit.image} alt={suit.name} />
          </div>
        </>
      ) : null}
    </div>
  );
}

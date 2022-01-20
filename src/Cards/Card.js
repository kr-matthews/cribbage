import Suit from "./Suit.js";

import "./card.css";
import playingCardBack from "./playing_card_back.svg";

const backgroundImage = `url(${playingCardBack})`;
const backgroundColor = "White";

const UNSELECTED_BORDER = "#0b2652"; // attempt to match background picture
const SELECTED_BORDER = "Red";

const RED_SUIT = "#85221b"; // attempt to match suit colour
const BLACK_SUIT = "Black";

export default function Card({ rank, suit, faceUp = false, selected = false }) {
  const borderColor = selected ? SELECTED_BORDER : UNSELECTED_BORDER;
  const color =
    suit === Suit.HEART || suit === Suit.DIAMOND ? RED_SUIT : BLACK_SUIT;
  const style = faceUp
    ? { borderColor, backgroundColor }
    : { borderColor, backgroundImage };
  return (
    <div className="card" style={style}>
      {faceUp ? (
        <>
          <div className="card-info" style={{ color }}>
            {rank.symbol}
          </div>
          <div className="card-info">
            <img src={suit.image} alt={`${suit.name}`} />
          </div>
        </>
      ) : null}
    </div>
  );
}

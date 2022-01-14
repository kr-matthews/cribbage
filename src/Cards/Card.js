import "./card.css";
import playingCardBack from "./playing_card_back.svg";

const backgroundImage = `url(${playingCardBack})`;

const UNSELECTED_BORDER = "#0b2652"; // attempt to match background picture
const SELECTED_BORDER = "LightGrey";

export default function Card({ rank, suit, faceUp = false, selected = false }) {
  const borderColor = selected ? SELECTED_BORDER : UNSELECTED_BORDER;
  const style = faceUp ? { borderColor } : { borderColor, backgroundImage };
  return (
    <div className="card" style={style}>
      {faceUp ? (
        <>
          <span className="card-info">{rank.symbol}</span>
          <img src={suit.image} className="card-info" />
        </>
      ) : null}
    </div>
  );
}

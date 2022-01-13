import "./card.css";

export default function Card({ rank, suit, faceUp = false, selected = false }) {
  const borderColor = selected ? "Black" : "Grey";
  return (
    <div className="card" style={{ borderColor }}>
      {faceUp ? (
        <>
          <span className="card-info">{rank.symbol}</span>
          <img src={suit.image} className="card-info" />
        </>
      ) : null}
    </div>
  );
}

export default function Card({ rank, suit, faceUp, selected }) {
  return (
    <div className="card">
      {rank} of {suit}
    </div>
  );
}

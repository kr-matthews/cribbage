import boardImage from "./real-board.jpg";

export default function ScoreBoard({ gamePoints, currentScores, priorScores }) {
  return (
    <>
      <div className="game-component">
        <img className="board" src={boardImage} alt="Score board" />
      </div>
      <div>game points: {gamePoints.join(", ")}</div>
    </>
  );
}

// todo SCOREBOARD: use an image as a background, place pins/circles on top

// if only 2 players, use inner and outer tracks

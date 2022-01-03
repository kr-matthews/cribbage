import { useGame } from "./../Hooks/useGame.js";

import ScoreBoard from "./../ScoreBoard/ScoreBoard.js";
import Banner from "./Banner.js";
import Hands from "./Hands.js";
import PlayArea from "./PlayArea.js";
import GameButtons from "./GameButtons.js";
import PlayByPlay from "./PlayByPlay.js";

// TODO: GAME: build out individual components

export default function Game() {
  const game = useGame();
  const showAllComponents = ["ongoing", "over"].includes(game.status);
  return (
    <>
      <ScoreBoard />
      <Banner />
      {showAllComponents && <Hands />}
      {showAllComponents && <PlayArea />}
      <GameButtons />
      {showAllComponents && <PlayByPlay />}
    </>
  );
}

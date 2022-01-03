import { useGame } from "./../Hooks/useGame.js";

import Header from "./Header.js";
import Hands from "./Hands.js";
import PlayArea from "./PlayArea.js";
import ScoreBoard from "./../ScoreBoard/ScoreBoard.js";
import PlayHistory from "./PlayHistory.js";

// TODO: NEXT: remove Game and put this directly in App

export default function Game() {
  const game = useGame();

  return (
    <>
      <Header />
      <Hands />
      <PlayArea />
      <ScoreBoard />
      <PlayHistory />
    </>
  );
}

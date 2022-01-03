import GamesHoles from "./GamesHoles.js";
import StartHoles from "./StartHoles.js";
import BottomCurve from "./BottomCurve.js";
import StraightSegments from "./StraightSegments.js";
import TopCurvesAndFinish from "./TopCurvesAndFinish.js";

// TODO: BOARD: consider using a background image and placing dots on top

export default function ScoreBoard() {
  return (
    <div className="game-component">
      <GamesHoles />
      <StartHoles />
      <BottomCurve />
      <StraightSegments />
      <TopCurvesAndFinish />
    </div>
  );
}

export default function ScoreBoard({
  colours,
  gamePoints,
  currentScores,
  priorScores,
}) {
  return (
    <div className="game-component">
      <ScoreBoardSegmentRegular colours={colours} upperIndex={85} />
      <ScoreBoardSegmentRegular
        colours={colours}
        upperIndex={90}
        skunkLine="S"
      />
      {/* //~ */}
      <ScoreBoardSegmentRegular colours={colours} upperIndex={95} />
      <ScoreBoardSegmentRegular colours={colours} upperIndex={100} />
      <ScoreBoardSegmentRegular colours={colours} upperIndex={105} />
      <ScoreBoardSegmentRegular colours={colours} upperIndex={110} />
      <ScoreBoardSegmentRegular colours={colours} upperIndex={115} />
      <ScoreBoardSegmentRegular colours={colours} upperIndex={120} />
    </div>
  );
}

function ScoreBoardSegmentRegular({
  colours,
  isOrientedUp = true,
  upperIndex,
  skunkLine,
}) {
  return (
    <span>
      <table className="segment">
        <tbody>
          {[0, 1, 2].map((row) => (
            <tr
              key={row}
              style={{
                backgroundColor: rowColour(colours, row, isOrientedUp),
              }}
            >
              {[0, 1, 2, 3, 4].map((ind) => (
                <td
                  key={ind}
                  style={cellStyle(row, ind, colours, isOrientedUp, upperIndex)}
                >
                  O
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={upperIndexStyle}>{skunkLine || upperIndex}</div>
    </span>
  );
}

function rowColour(colours, row, isOrientedUp) {
  return colours[isOrientedUp ? row : 2 - row];
}

function cellStyle(row, ind, colours, isOrientedUp, upperIndex) {
  let style = {
    padding: 0,
    margin: 0,
    border: "black",
    borderTop: "solid var(--score-board-boarder-width) black",
    borderBottom: "solid var(--score-board-boarder-width) black",
    textAlign: "center",
    width: "1.5em",
    height: "1.5em",
  };
  if (ind === 0) {
    style.paddingLeft = "0.5em";
    style.borderLeft = `solid var(--score-board-boarder-width) ${
      row === 1 ? colours[1] : "black"
    }`;
  }
  if (ind === 4) {
    style.paddingRight = "0.5em";
    if (upperIndex === 120) {
      style.borderRight = `solid var(--score-board-boarder-width) ${
        row === 1 ? colours[1] : "black"
      }`;
    }
  }
  return style;
}

// ! fix upperIndex positioning
const upperIndexStyle = {
  width: "2em",
  textAlign: "center",
  position: "relative",
  top: "-3.05em",
  left: "7.55em",
  color: "black",
};

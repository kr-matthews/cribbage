export default function ScoreBoard({
  colours,
  gamePoints,
  currentScores,
  priorScores,
}) {
  return (
    <div className="game-component">
      <div className="board-rows">
        <div className="board-row">
          {[0, 5, 10, 15, 20, 25, 30, 35, 40].map((upperIndex) => (
            <ScoreBoardSegmentRegular
              key={upperIndex}
              colours={colours}
              currentScores={currentScores}
              priorScores={priorScores}
              upperIndex={upperIndex}
              skunkLine={upperIndex === 30 && "SSS"}
            />
          ))}
        </div>
        <div className="board-row">
          {[85, 90, 95, 100, 105, 110, 115, 120, 0].map((upperIndex) => (
            <ScoreBoardSegmentRegular
              key={upperIndex}
              colours={colours}
              currentScores={currentScores}
              priorScores={priorScores}
              upperIndex={upperIndex}
              skunkLine={upperIndex === 90 && "S"}
            />
          ))}
        </div>
        <div className="board-row">
          {[0, 80, 75, 70, 65, 60, 55, 50, 45].map((upperIndex) => (
            <ScoreBoardSegmentRegular
              key={upperIndex}
              colours={colours}
              currentScores={currentScores}
              priorScores={priorScores}
              upperIndex={upperIndex}
              isOrientedUp={false}
              skunkLine={upperIndex === 60 && "SS"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// !!! add 'start' holes
// !!! add game points holes
// !! make bent segments
// ! add finish hole
// todo: get skunk lines from useScores?
// todo: clean up

function ScoreBoardSegmentRegular({
  colours,
  currentScores,
  priorScores,
  isOrientedUp = true,
  upperIndex,
  skunkLine,
}) {
  return (
    <span className={upperIndex === 0 ? "invisible" : ""}>
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
                  <span
                    className="dot"
                    style={dotStyle(
                      colours,
                      row,
                      ind,
                      isOrientedUp,
                      upperIndex,
                      currentScores,
                      priorScores
                    )}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={upperIndexStyle(isOrientedUp)}>{skunkLine || upperIndex}</div>
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
    minWidth: "1.5em",
    height: "1.25em",
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

function dotStyle(
  colours,
  row,
  ind,
  isOrientedUp,
  upperIndex,
  currentScores,
  priorScores
) {
  let playerCount = currentScores.length;

  if (row !== 1 || playerCount !== 2) {
    let playerIndex = playerCount === 3 ? row : row / 2;
    isOrientedUp || (playerIndex = playerCount - 1 - playerIndex);

    let dotIndex = upperIndex - (isOrientedUp ? 4 - ind : ind);
    if (
      [currentScores[playerIndex], priorScores[playerIndex]].includes(dotIndex)
    ) {
      // there is a peg here, for playerIndex
      return { backgroundColor: "AliceBlue" };
    }
  }

  // there's no peg here
  return { backgroundColor: rowColour(colours, row, isOrientedUp) };
}

// ! fix upperIndex positioning (stop mixing pixels and em?); calculate it
function upperIndexStyle(isOrientedUp) {
  return {
    width: "2em",
    textAlign: "center",
    position: "relative",
    top: "-2.2em",
    left: isOrientedUp ? "7.65em" : "-0.9em",
    color: "black",
  };
}

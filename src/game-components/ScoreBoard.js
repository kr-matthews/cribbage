const WOOD_COMPLEMENT = "#335B96";

export default function ScoreBoard({
  colours,
  gamePoints,
  currentScores,
  priorScores,
  skunkLine,
  doubleSkunkLine,
  tripleSkunkLine,
}) {
  function skunkLineOrIndex(upperIndex) {
    switch (upperIndex) {
      case skunkLine:
        return "S";

      case doubleSkunkLine:
        return "SS";

      case tripleSkunkLine:
        return "SSS";

      default:
        return upperIndex;
    }
  }
  return (
    <div className="game-component">
      <div
        style={{
          display: "flex",
          margin: "0 auto",
          padding: "20px 20px 8px 20px",
          backgroundColor: "#966F33",
          borderRadius: 10,
        }}
      >
        {/* game points holes */}
        <GridOfHoles
          rows={7}
          cols={3}
          cellWidth={25}
          cellHeight={30.5}
          holeRadius={6}
          allBorders
          colours={colours}
          pathRotation={0.75}
          pegLocations={[[], [0, 1], [1, 0, 1], [], [], [], []]}
        />
        <div style={{ marginLeft: 15 }} className="board-rows">
          <div className="board-row">
            <span style={{ display: "flex" }}>
              {/* start holes */}
              <GridOfHoles
                rows={3}
                cols={3}
                cellWidth={35}
                cellHeight={20}
                holeRadius={6}
                allBorders
                colours={colours}
                pegLocations={[[], [0, 1], [1, 0, 1], [], [], [], []]}
              />
              <span
                style={{
                  writingMode: "vertical-rl",
                  height: 3 * 20,
                  margin: "auto 0",
                  padding: 8,
                }}
              >
                <strong>START</strong>
              </span>
            </span>
            {[5, 10, 15, 20, 25, 30, 35, 40].map((upperIndex) => (
              <GridOfHoles
                key={upperIndex}
                rows={3}
                cols={5}
                cellWidth={25}
                cellHeight={20}
                holeRadius={6}
                sidePadding={10}
                closeLeftMiddle={upperIndex === 5}
                colours={colours}
                displayText={skunkLineOrIndex(upperIndex)}
                displaySide={"right"}
                pegLocations={[[], [0, 1], [1, 0, 1], [], [], [], []]}
              />
            ))}
          </div>
          <div className="board-row">
            {[85, 90, 95, 100, 105, 110, 115, 120].map((upperIndex) => (
              <GridOfHoles
                key={upperIndex}
                rows={3}
                cols={5}
                cellWidth={25}
                cellHeight={20}
                holeRadius={6}
                sidePadding={10}
                closeRight={upperIndex === 120}
                colours={colours}
                displayText={skunkLineOrIndex(upperIndex)}
                displaySide={"right"}
                pegLocations={[[], [0, 1], [1, 0, 1], [], [], [], []]}
                visible={upperIndex !== 0}
              />
            ))}
          </div>
          <div className="board-row">
            {[0, 80, 75, 70, 65, 60, 55, 50, 45].map((upperIndex) => (
              <GridOfHoles
                key={upperIndex}
                rows={3}
                cols={5}
                cellWidth={25}
                cellHeight={20}
                holeRadius={6}
                sidePadding={10}
                colours={colours}
                pathRotation={0.5}
                displayText={skunkLineOrIndex(upperIndex)}
                displaySide={"left"}
                pegLocations={[[], [0, 1], [1, 0, 1], [], [], [], []]}
                visible={upperIndex !== 0}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// !!! add finish hole
// !!! add actual peg locations
// !! extract colours as CONSTs, play around with colours
// !! tidy up classNames and styles (including .css file)
// ! make bent segments ???

function GridOfHoles({
  rows,
  cols,
  cellHeight,
  cellWidth,
  holeRadius,
  sidePadding,
  allBorders,
  closeLeftMiddle,
  closeRight,
  colours,
  pathRotation,
  displayText,
  displaySide,
  pegLocations = Array(rows).fill(Array(cols).fill(false)),
  visible = true,
}) {
  return (
    <span
      style={{ visibility: visible ? "visible" : "hidden", marginBottom: -5 }}
    >
      <table
        style={{
          borderSpacing: 0,
          borderCollapse: "collapse",
          border: "none",
        }}
      >
        <tbody>
          {[...Array(rows).keys()].map((_, row) => (
            <tr key={row}>
              {[...Array(cols).keys()].map((_, col) => {
                let colour =
                  colours[
                    pathRotation === 0.25
                      ? cols - col - 1
                      : pathRotation === 0.5
                      ? rows - row - 1
                      : pathRotation === 0.75
                      ? col
                      : row
                  ];
                return (
                  <GridCell
                    key={col}
                    width={cellWidth}
                    height={cellHeight}
                    borderLeft={
                      allBorders ||
                      ((row !== 1 || closeLeftMiddle) && col === 0)
                        ? "present"
                        : row === 1 && col === 0
                        ? "fake"
                        : "absent"
                    }
                    borderRight={
                      allBorders ||
                      (closeRight && col === cols - 1 && row !== 1)
                        ? "present"
                        : "absent"
                    }
                    colour={colour}
                    paddingLeft={col === 0 && sidePadding}
                    paddingRight={col === cols - 1 && sidePadding}
                  >
                    <PegHole
                      holeRadius={holeRadius}
                      colour={colour}
                      hasPeg={pegLocations[row][col]}
                    />
                  </GridCell>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {displayText && (
        <div
          style={{
            width: 30,
            textAlign: "center",
            position: "relative",
            top: -2 * cellHeight - 3.5, // adjust for borders; assumes 3 rows anyway
            left:
              displaySide === "right"
                ? cols * cellWidth + 2 * sidePadding + 2 - 14
                : -14,
            color: "black",
          }}
        >
          <strong>{displayText}</strong>
        </div>
      )}
    </span>
  );
}

function GridCell({
  width,
  height,
  borderRight,
  borderLeft,
  colour,
  paddingLeft,
  paddingRight,
  children,
}) {
  let borderPresentStyle = "solid 2px black";
  let borderAbsentStyle = "none";
  let borderFakeStyle = `solid 2px ${colour}`;
  return (
    <td
      style={{
        padding: 0,
        margin: 0,
        height,
        width,
        minWidth: width,
        textAlign: "center",
        backgroundColor: colour,
        border: "black",
        borderRight:
          borderRight === "present"
            ? borderPresentStyle
            : borderRight === "fake"
            ? borderFakeStyle
            : borderAbsentStyle,
        borderLeft:
          borderLeft === "present"
            ? borderPresentStyle
            : borderLeft === "fake"
            ? borderFakeStyle
            : borderAbsentStyle,
        borderTop: borderPresentStyle,
        borderBottom: borderPresentStyle,
        paddingLeft: paddingLeft || 0,
        paddingRight: paddingRight || 0,
      }}
    >
      {children}
    </td>
  );
}

function PegHole({ holeRadius, colour, hasPeg }) {
  let borderWidth = 0.5;
  return (
    <span
      style={{
        padding: 0,
        margin: 0,
        height: 2 * (holeRadius - borderWidth),
        width: 2 * (holeRadius - borderWidth),
        borderStyle: "solid",
        borderRadius: "50%",
        borderWidth,
        display: "inline-block",
        borderColor: "aliceblue",
        backgroundColor: hasPeg ? "aliceblue" : colour,
      }}
    />
  );
}

//// old ////

function getPlayerIndex(playerCount, row, isOrientedUp) {
  let playerIndex = playerCount === 3 ? row : row / 2;
  isOrientedUp || (playerIndex = playerCount - 1 - playerIndex);
  return playerIndex;
}

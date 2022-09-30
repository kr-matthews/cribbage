//// constants ////

// colours
const WOOD = "#ECCD3F";
const BLACK = "black";
const WHITEISH = "aliceblue";

// repeated colour usages
const TABLE_BORDER_COLOUR = BLACK;
const BOARD_COLOUR = WOOD;

// dimensions
const HOLE_RADIUS = 6;
const STANDARD_WIDTH = 25;
const STANDARD_HEIGHT = 20;
const SIDE_PADDING = 10;

//// main component ////

// ? how to make bent segments (35->45 and 80->85)

export default function ScoreBoard({
  pathColours,
  pegColours,
  gamePoints,
  currentScores,
  priorScores,
  hasWinner,
  winner,
  skunkLine,
  doubleSkunkLine,
  tripleSkunkLine,
}) {
  let paddedGamePoints = padGamePoints(gamePoints);
  let paddedScores = padScores(currentScores, priorScores);

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
          padding: "20px 20px 8px 20px", // awkward, due to floating 'upperIndex's
          backgroundColor: BOARD_COLOUR,
          borderRadius: 20,
        }}
      >
        {/* game points holes */}
        <GridOfHoles
          rows={7}
          cols={3}
          cellWidth={25}
          cellHeight={30.5}
          holeRadius={HOLE_RADIUS}
          allBorders
          pathColours={pathColours}
          pegColours={pegColours}
          pathRotation={0.75}
          pegLocations={translate(paddedGamePoints, 1)}
        />
        <div style={{ marginLeft: 15 }}>
          <div className="board-row">
            <span style={{ display: "flex" }}>
              {/* start holes */}
              <GridOfHoles
                rows={3}
                cols={3}
                cellWidth={35}
                cellHeight={20}
                holeRadius={HOLE_RADIUS}
                allBorders
                pathColours={pathColours}
                pegColours={pegColours}
                pegLocations={translate(paddedScores, -2).map((arr, ind) =>
                  paddedGamePoints[ind].includes(0) ? [0, ...arr] : arr
                )}
              />
              <ScoreBoardText text="START" />
            </span>

            {/* top row holes */}
            {[5, 10, 15, 20, 25, 30, 35, 40].map((upperIndex) => (
              <GridOfHoles
                key={upperIndex}
                sidePadding={SIDE_PADDING}
                closeStartMiddle={upperIndex === 5}
                pathColours={pathColours}
                pegColours={pegColours}
                displayText={skunkLineOrIndex(upperIndex)}
                displaySide={"right"}
                pegLocations={translate(paddedScores, upperIndex - 4)}
              />
            ))}
          </div>

          {/* middle row holes */}
          <div className="board-row">
            {[85, 90, 95, 100, 105, 110, 115, 120].map((upperIndex) => (
              <GridOfHoles
                key={upperIndex}
                sidePadding={SIDE_PADDING}
                closeEnd={upperIndex === 120}
                pathColours={pathColours}
                pegColours={pegColours}
                displayText={skunkLineOrIndex(upperIndex)}
                displaySide={"right"}
                pegLocations={translate(paddedScores, upperIndex - 4)}
                visible={upperIndex !== 0}
              />
            ))}

            <span style={{ fontSize: 44, paddingLeft: 15 }}>&#8594;</span>
            {/* finish hole */}
            <PegHole
              holeRadius={HOLE_RADIUS}
              surroundingColour={BOARD_COLOUR}
              hasPeg={hasWinner}
              pegColour={hasWinner && pegColours[winner]}
              customMarginTop={STANDARD_HEIGHT + 8}
            />
            <ScoreBoardText text="FINISH" />
          </div>

          {/* bottom row holes */}
          <div className="board-row">
            {[0, 80, 75, 70, 65, 60, 55, 50, 45].map((upperIndex) => (
              <GridOfHoles
                key={upperIndex}
                sidePadding={SIDE_PADDING}
                pathColours={pathColours}
                pegColours={pegColours}
                pathRotation={0.5}
                displayText={skunkLineOrIndex(upperIndex)}
                displaySide={"left"}
                pegLocations={translate(paddedScores, upperIndex - 4)}
                visible={upperIndex !== 0}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

//// helper components ////

function GridOfHoles({
  rows = 3,
  cols = 5,
  cellWidth = STANDARD_WIDTH,
  cellHeight = STANDARD_HEIGHT,
  holeRadius = HOLE_RADIUS,
  sidePadding,
  allBorders,
  closeStartMiddle,
  closeEnd,
  pathColours,
  pegColours,
  pathRotation,
  displayText,
  displaySide,
  pegLocations = [[], [], []],
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
                // the "row" the player is going along, but it may be rotated
                let whichPath =
                  pathRotation === 0.25
                    ? cols - col - 1
                    : pathRotation === 0.5
                    ? rows - row - 1
                    : pathRotation === 0.75
                    ? col
                    : row;
                // how far along that "row" the player is
                let stepCount =
                  pathRotation === 0.25
                    ? row
                    : pathRotation === 0.5
                    ? cols - col - 1
                    : pathRotation === 0.75
                    ? rows - row - 1
                    : col;
                return (
                  <GridCell
                    key={col}
                    width={cellWidth}
                    height={cellHeight}
                    borderLeft={
                      allBorders ||
                      (col === 0 &&
                        ((!pathRotation && (row !== 1 || closeStartMiddle)) ||
                          (pathRotation === 0.5 && row !== 1 && closeEnd)))
                        ? "present"
                        : (!pathRotation ||
                            (pathRotation === 0.5 && closeEnd)) &&
                          row === 1 &&
                          col === 0
                        ? "fake"
                        : "absent"
                    }
                    borderRight={
                      allBorders ||
                      (col === cols - 1 &&
                        ((!pathRotation && row !== 1 && closeEnd) ||
                          (pathRotation === 0.5 &&
                            (row !== 1 || closeStartMiddle))))
                        ? "present"
                        : ((!pathRotation && closeEnd) ||
                            pathRotation === 0.5) &&
                          row === 1 &&
                          col === cols - 1
                        ? "fake"
                        : "absent"
                    }
                    colour={pathColours[whichPath]}
                    paddingLeft={col === 0 && sidePadding}
                    paddingRight={col === cols - 1 && sidePadding}
                  >
                    <PegHole
                      holeRadius={holeRadius}
                      surroundingColour={pathColours[whichPath]}
                      hasPeg={pegLocations[whichPath].includes(stepCount)}
                      pegColour={pegColours[whichPath]}
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
  let borderPresentStyle = `solid 2px ${TABLE_BORDER_COLOUR}`;
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
        border: TABLE_BORDER_COLOUR,
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

function PegHole({
  holeRadius,
  surroundingColour,
  hasPeg,
  pegColour,
  customMarginTop,
}) {
  let borderWidth = 0.5;
  return (
    <span
      style={{
        padding: 0,
        marginTop: customMarginTop || 0,
        height: 2 * (holeRadius - borderWidth),
        width: 2 * (holeRadius - borderWidth),
        borderStyle: "solid",
        borderRadius: "50%",
        borderWidth,
        display: "inline-block",
        borderColor: hasPeg
          ? BLACK
          : surroundingColour === BOARD_COLOUR
          ? BLACK
          : BOARD_COLOUR,
        backgroundColor: hasPeg ? BLACK : BOARD_COLOUR,
      }}
    />
  );
}

function ScoreBoardText({ text }) {
  return (
    <span
      style={{
        writingMode: "vertical-rl",
        height: 3 * 20,
        padding: 8,
      }}
    >
      <strong>{text}</strong>
    </span>
  );
}

//// helper functions - array manipulation ////

function padToThreePlayers(array) {
  let playerCount = array.length;
  switch (playerCount) {
    case 0:
      return [[], [], []];

    case 1:
      return [array[0], [], []];

    case 2:
      return [array[0], [], array[1]];

    default:
      return array;
  }
}

function padGamePoints(points) {
  return padToThreePlayers(points.map((point) => [point]));
}

function padScores(current, prior) {
  return padToThreePlayers(mergeArrays(current, prior));
}

function mergeArrays(array1, array2) {
  let array = [];
  array1.forEach((x, i) => {
    array.push([x, array2[i]]);
  });
  return array;
}

function translate(arrays, offset) {
  return arrays.map((array) => array.map((x) => x - offset));
}

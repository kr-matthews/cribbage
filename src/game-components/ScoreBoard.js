const WOOD = "#966F33";
const WOOD_COMPLEMENT = "#335B96";

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

export default function ScoreBoard({
  colours,
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
          padding: "20px 20px 8px 20px",
          backgroundColor: WOOD,
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
          pegLocations={translate(paddedGamePoints, 1)}
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
                pegLocations={translate(paddedScores, -2).map((arr, ind) =>
                  paddedGamePoints[ind].includes(0) ? [0, ...arr] : arr
                )}
              />
              <ScoreBoardText text="START" />
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
                pegLocations={translate(paddedScores, upperIndex - 4)}
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
                pegLocations={translate(paddedScores, upperIndex - 4)}
                visible={upperIndex !== 0}
              />
            ))}
            <span style={{ fontSize: 44, paddingLeft: 15 }}>&#8594;</span>
            <PegHole
              holeRadius={6}
              colour={WOOD}
              // pegColour={hasWinner ? colours[winner] : WOOD} // !! fix PegHole
              hasPeg={hasWinner}
              customMarginTop={28}
            />
            <ScoreBoardText text="FINISH" />
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

// !!! tidy up classNames and styles (including .css file)
// !! extract colours as CONSTs, play around with colours
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
                let colour = colours[whichPath];
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
                      hasPeg={pegLocations[whichPath].includes(stepCount)}
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

function PegHole({ holeRadius, colour, hasPeg, customMarginTop }) {
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
        borderColor: "aliceblue",
        backgroundColor: hasPeg ? "aliceblue" : colour,
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

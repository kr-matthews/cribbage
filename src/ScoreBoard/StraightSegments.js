export default function StraightSegments() {
  var segments = [];
  for (var i = 0; i < 21; i++) {
    segments.push(<StraightSegment />);
  }
  return <span className="middle-board">{segments}</span>;
}

function StraightSegment() {
  return <span className="straight-segment">Straight Segment</span>;
}

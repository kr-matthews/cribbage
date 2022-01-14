import Card from "./../Cards/Card.js";

import Suit from "./../Cards/Suit.js";
import Rank from "./../Cards/Rank.js";

export default function Deck({ deckSize = 52, isDeckCut = false, starter }) {
  return (
    // TEMP:
    <div>
      <Card rank={Rank.ACE} suit={Suit.CLUB} faceUp={true} />
      <Card rank={Rank.QUEEN} suit={Suit.DIAMOND} faceUp={true} />
      <Card rank={Rank.TWO} suit={Suit.SPADE} faceUp={true} selected={true} />
      <Card rank={Rank.TEN} suit={Suit.HEART} faceUp={true} />
      <Card faceUp={false} />
    </div>
  );
}

// TODO: NEXT: Card.js, then Deck.js, then PlayArea.js

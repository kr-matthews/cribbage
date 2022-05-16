export default class Action {
  //// App ////
  static RESET_ALL = new Action("Reset", "reset the match and all history");

  //// Cut For Deal ////
  static SET_UP_CUT_FOR_DEAL = new Action(
    "Begin",
    "confirmed players and shuffled the deck",
    "confirm players and shuffle the deck"
  );
  static CUT_FOR_DEAL = new Action("Cut", null, "cut for deal");
  static SET_UP_CUT_FOR_DEAL_RETRY = new Action(
    "Try Again",
    "reshuffled the deck",
    "gather the deck and try again"
  );

  //// Game ////
  static START_FIRST_GAME = new Action(
    "First Game",
    "claimed dealer and shuffled the deck for the first game",
    "claim dealer and start the game"
  );
  static START_NEW_GAME = new Action(
    "Next Game",
    "shuffled the deck for a new game",
    "gather the deck, shuffle it, and start the next game"
  );
  static START_NEW_ROUND = new Action(
    "Next Round",
    "shuffled the deck for the next round",
    "gather the deck, shuffle it, and start the next round"
  );

  //// Round ////
  static START_DEALING = new Action(
    "Deal",
    "dealt the cards for the round",
    "deal the round"
  );
  static CONTINUE_DEALING = new Action(null, null, "finish dealing");
  static DISCARD = new Action(
    "Discard",
    null, //"discarded to the crib",
    "discard to the crib"
  );
  static CUT_FOR_STARTER = new Action("Cut", "cut the deck", "cut the deck");
  static FLIP_STARTER = new Action("Flip", null, "flip the starter");
  static PLAY = new Action("Play", null, null);
  static GO = new Action("Go", ": 'Go'", null);
  static PLAY_OR_GO = new Action(null, null, "play a card, or go");
  static FLIP_PLAYED_CARDS = new Action(
    "Next",
    "flipped the old cards over",
    "flip the cards"
  );
  static RETURN_CARDS_TO_HANDS = new Action(
    "Return Cards",
    "started the hand-scoring phase",
    "start the hand-scoring phase"
  );
  static SCORE_HAND = new Action(
    "Score Hand",
    null,
    "score your hand",
    "score their hand"
  );
  static SCORE_CRIB = new Action(
    "Score Crib",
    null,
    "score your crib",
    "score the crib"
  );

  /**
   * Create an Action to be the nextAction state.
   *
   * @param {String} label To display on buttons.
   * @param {String} pastDescription To display in match logs. null if match logs requires context-specific info.
   * @param {String} futureDescriptionOfSelf To display as "Your turn to [message]." Defaults to null.
   * @param {String} futureDescriptionOfOther To display as "Waiting for [player] to [message]." Defaults to futureDescriptionOfSelf.
   */
  constructor(
    label,
    pastDescription,
    futureDescriptionOfSelf,
    futureDescriptionOfOther
  ) {
    this.label = label;
    this.pastDescription = pastDescription;
    this.futureDescriptionOfSelf = futureDescriptionOfSelf;
    this.futureDescriptionOfOther =
      futureDescriptionOfOther || futureDescriptionOfSelf;
  }
}

// !! remove pastDescription, add it to switch in match logs

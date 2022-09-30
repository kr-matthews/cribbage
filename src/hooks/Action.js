export default class Action {
  //// App ////
  static RESET_ALL = new Action("Reset");

  //// Cut For Deal ////
  static SET_UP_CUT_FOR_DEAL = new Action(
    "Begin",
    "confirm players and shuffle the deck"
  );
  static CUT_FOR_DEAL = new Action("Cut", "cut for deal");
  static SET_UP_CUT_FOR_DEAL_RETRY = new Action(
    "Try Again",
    "gather the deck and try again"
  );

  //// Game ////
  static START_FIRST_GAME = new Action(
    "First Game",
    "claim dealer and start the game"
  );
  static START_NEW_GAME = new Action(
    "Next Game",
    "gather the deck, shuffle it, and start the next game"
  );
  static START_NEW_ROUND = new Action(
    "Next Round",
    "gather the deck, shuffle it, and start the next round"
  );

  //// Round ////
  static START_DEALING = new Action("Deal", "deal the round");
  static CONTINUE_DEALING = new Action(null, "finish dealing");
  static DISCARD = new Action("Discard", "discard to the crib");
  static CUT_FOR_STARTER = new Action("Cut", "cut the deck");
  static FLIP_STARTER = new Action("Flip", "flip the starter");
  static PLAY = new Action("Play", null);
  static GO = new Action("Go", null);
  static PLAY_OR_GO = new Action(null, "play a card, or go");
  static FLIP_PLAYED_CARDS = new Action("Next", "flip the cards");
  static RETURN_CARDS_TO_HANDS = new Action(
    "Return Cards",
    "start the hand-scoring phase"
  );
  static SCORE_HAND = new Action(
    "Score Hand",
    "score your hand",
    "score their hand"
  );
  static SCORE_CRIB = new Action(
    "Score Crib",
    "score your crib",
    "score the crib"
  );

  static CONTINUE = new Action("Continue", "continue");

  /**
   * Create an Action to be the nextAction state.
   *
   * @param {String} label To display on buttons.
   * @param {String} futureDescriptionOfSelf To display as "Your turn to [message]." Defaults to null.
   * @param {String} futureDescriptionOfOther To display as "Waiting for [player] to [message]." Defaults to futureDescriptionOfSelf.
   */
  constructor(label, futureDescriptionOfSelf, futureDescriptionOfOther) {
    this.label = label;
    this.futureDescriptionOfSelf = futureDescriptionOfSelf;
    this.futureDescriptionOfOther =
      futureDescriptionOfOther || futureDescriptionOfSelf;
  }
}

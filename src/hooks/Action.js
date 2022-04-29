export default class Action {
  //// App ////
  static RESET_ALL = new Action("Reset", "reset");

  //// Cut For Deal ////
  static SET_UP_CUT_FOR_DEAL = new Action(
    "Begin",
    "confirm players and shuffle the deck"
  );
  static CUT_FOR_DEAL = new Action("Cut", "cut for deal");
  static SET_UP_CUT_FOR_DEAL_RETRY = new Action(
    "Try Again",
    "gather the deck, shuffle it, and try again"
  );

  //// Game ////
  static START_FIRST_GAME = new Action(
    "First Game",
    "gather the deck, shuffle it, and start the game"
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
  static PLAY = new Action("Play", "");
  static GO = new Action("Go", "");
  static PLAY_OR_GO = new Action(null, "play a card, or go");
  static FLIP_PLAYED_CARDS = new Action("Next", "flip the cards");
  static RETURN_CARDS_TO_HANDS = new Action(
    "Return Cards",
    "return cards to hands"
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

  /**
   * Create an Action to be the nextAction state.
   *
   * @param {String} internalMessage To display as "Your turn to [message]."
   * @param {String} externalMessage To display as "Waiting for [player] to [message]." Defaults to internalMessage.
   */
  constructor(label, internalMessage, externalMessage) {
    this.label = label;
    this.internalMessage = internalMessage;
    this.externalMessage = externalMessage || internalMessage;
  }
}

export default class Action {
  //// Start
  static LOCK_IN_PLAYERS = new Action("Begin", "confirm players and shuffle");

  //// Cut For Deal
  static CUT_FOR_DEAL = new Action("Cut", "cut for deal");
  static RETRY_CUT_FOR_DEAL = new Action(
    "Try Again",
    "gather the deck, shuffle it, and try again"
  );
  static START_FIRST_GAME = new Action(
    "First Round",
    "gather the deck, shuffle it, and deal"
  );

  //// Game
  // Round
  static START_DEALING = new Action("Deal", "deal the round");
  static DEAL = new Action(null, "finish dealing");
  static DISCARD = new Action("Discard", "discard to the crib");
  static CUT_FOR_STARTER = new Action("Cut", "cut the deck");
  static FLIP_STARTER = new Action("Flip", "flip the starter");
  static PLAY = new Action("Play", "play a card, or go");
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
  static START_NEW_ROUND = new Action(
    "Next Round",
    "gather the deck, shuffle it, and start the next round"
  );
  // Post-Rounds
  static START_NEW_GAME = new Action("New Game", "start a new game");

  static RESET_ALL = new Action("Reset", "reset");

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

//// Possible actions:
// start
// cut for deal
// repeat (a round):
//  deal
//  send to crib
//  cut
//  flip
//  play - suboptions: play, for 15, for _-of-a-kind, for a-run-of-_) -- CAN HAVE MUTLTIPLE (ex: 5, 4, 6)
//  go
//  [scoring] 15, pair, run, flush, his nobs, submit points
//  [opp scoring] accept score, claim missed points
//  [claiming] 15, pair, run, flush, his nobs, submit points
//  reset
// new game

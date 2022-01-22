import club from "./images/club.svg";
import diamond from "./images/diamond.svg";
import spade from "./images/spade.svg";
import heart from "./images/heart.svg";

export default class Suit {
  static CLUB = new Suit("Club", club);
  static DIAMOND = new Suit("Diamond", diamond);
  static SPADE = new Suit("Spade", spade);
  static HEART = new Suit("Heart", heart);

  constructor(name, image) {
    this.name = name;
    this.image = image;
  }
}

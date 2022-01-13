import club from "./club.svg";
import diamond from "./diamond.svg";
import spade from "./spade.svg";
import heart from "./heart.svg";

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

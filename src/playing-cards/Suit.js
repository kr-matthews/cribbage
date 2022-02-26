import club from "./images/club.svg";
import diamond from "./images/diamond.svg";
import spade from "./images/spade.svg";
import heart from "./images/heart.svg";

export default class Suit {
  static CLUB = new Suit("Club", club, 0);
  static DIAMOND = new Suit("Diamond", diamond, 1);
  static SPADE = new Suit("Spade", spade, 2);
  static HEART = new Suit("Heart", heart, 3);

  constructor(name, image, index) {
    this.name = name;
    this.image = image;
    this.index = index;
  }
}

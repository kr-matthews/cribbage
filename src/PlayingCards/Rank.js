export default class Rank {
  static ACE = new Rank("Ace", "A", 0, 1);
  static TWO = new Rank("Two", "2", 1, 2);
  static THREE = new Rank("Three", "3", 2, 3);
  static FOUR = new Rank("Four", "4", 3, 4);
  static FIVE = new Rank("Five", "5", 4, 5);
  static SIX = new Rank("Six", "6", 5, 6);
  static SEVEN = new Rank("Seven", "7", 6, 7);
  static EIGHT = new Rank("Eight", "8", 7, 8);
  static NINE = new Rank("Nine", "9", 8, 9);
  static TEN = new Rank("Ten", "10", 9, 10);
  static JACK = new Rank("Jack", "J", 10, 10);
  static QUEEN = new Rank("Queen", "Q", 11, 10);
  static KING = new Rank("King", "K", 12, 10);

  constructor(name, symbol, index, points) {
    this.name = name;
    this.symbol = symbol;
    this.index = index;
    this.points = points;
  }
}

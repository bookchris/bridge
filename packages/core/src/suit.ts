const suits = ["♣", "♦", "♥", "♠", "NT"];

export class Suit {
  public static Club = new Suit("♣");
  public static Diamond = new Suit("♦");
  public static Heart = new Suit("♥");
  public static Spade = new Suit("♠");
  public static NoTrump = new Suit("NT");

  constructor(public readonly value: string) {
    if (!suits.includes(value)) {
      throw new Error("Invalid value passed to Suit: " + value);
    }
  }

  toString() {
    return this.value;
  }

  index() {
    return suits.indexOf(this.value);
  }
}

export const AllSuits = suits.map((s) => new Suit(s));

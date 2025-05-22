import { linFromSuit } from "./lin";
import { AllSuits, Suit } from "./suit";

export const SuitBids = ["1", "2", "3", "4", "5", "6", "7"].reduce(
  (res, bid: string) => {
    const level = AllSuits.map((s) => bid + s);
    return res.concat(level);
  },
  [] as string[]
);

export class Bid {
  static Pass = new Bid("Pass");
  static Double = new Bid("X");
  static Redouble = new Bid("XX");

  readonly bid: string;
  readonly suit?: Suit;
  readonly level?: number;
  readonly index?: number;

  constructor(bid: string) {
    this.bid = bid;
    if (bid[0] === "P") {
      this.bid = "Pass";
    } else if (bid === "X" || bid === "XX") {
      this.bid = bid;
    } else {
      this.level = parseInt(bid[0]);
      this.suit = new Suit(bid.substring(1));
      this.bid = `${this.level}${this.suit}`;
      this.index = SuitBids.indexOf(this.bid);
      if (this.index === -1) {
        throw new Error(`${bid} is not a valid bid`);
      }
    }
  }

  toString() {
    return this.bid;
  }

  toJson() {
    return this.toString();
  }

  toBen() {
    if (this.index !== undefined) {
      if (!this.suit) {
        throw new Error("bad state, index but no suit");
      }
      return `${this.level}${linFromSuit(this.suit)}`;
    }
    if (this.bid === "Pass") {
      return "PASS";
    }
    return this.bid;
  }
}

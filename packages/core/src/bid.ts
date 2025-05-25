import { AllSuits, Suit } from "./suit";

const suitBids = ["1", "2", "3", "4", "5", "6", "7"].reduce(
  (res, bid: string) => {
    const level = AllSuits.map((s) => bid + s);
    return res.concat(level);
  },
  [] as string[]
);
const bids = [...suitBids, "Pass", "X", "XX"];

export class Bid {
  static Pass = new Bid("Pass");
  static Double = new Bid("X");
  static Redouble = new Bid("XX");

  readonly suitBid?: {
    suit: Suit;
    level: number;
  };

  /*
  readonly suit?: Suit;
  readonly level?: number;
  readonly index?: number;
  */

  constructor(public readonly value: string) {
    if (!bids.includes(value)) {
      throw new Error("Invalid value passed to Bid: " + value);
    }
    if (suitBids.includes(value)) {
      this.suitBid = {
        suit: new Suit(value[1]),
        level: parseInt(value[0]),
      };
    }
  }

  equals(bid: Bid): boolean {
    return bid.value === this.value;
  }

  suitIndex(): number {
    const index = suitBids.indexOf(this.value);
    if (index == -1) {
      throw new Error(`suitIndex of non-suit bid ${this.value}`);
    }
    return index;
  }

  /*
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
  */
}

import { Seat } from "./seat";
import { Suit } from "./suit";

export class Contract {
  readonly suit: Suit;
  readonly level: number;
  readonly seat: Seat;
  readonly doubled: boolean;
  readonly redoubled: boolean;

  constructor(public readonly value: string) {
    if (value.length < 2) {
      throw new Error("Invalid contract value: " + value);
    }
    const parts = value.split("");

    this.level = parseInt(parts.shift() || "");

    let s = parts.shift() || "";
    if (s === "N") s += parts.shift();
    this.suit = new Suit(s);

    this.seat = Seat.fromChar(parts.shift() || "");

    const d = parts.join("");
    this.doubled = d === "X";
    this.redoubled = d === "XX";
    if (!this.doubled && !this.redoubled && d.length > 0) {
      throw new Error("Invalid contract value: " + value);
    }
  }
}

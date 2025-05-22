import { AllRanks, Rank } from "./rank";
import { Suit } from "./suit";

const cards = [Suit.Club, Suit.Diamond, Suit.Heart, Suit.Spade].reduce(
  (res, suit) => res.concat(AllRanks.map((rank) => `${rank}${suit}`)),
  [] as string[]
);

export class Card {
  readonly rank: Rank;
  readonly suit: Suit;

  constructor(public readonly value: string) {
    if (value.length != 2) {
      throw new Error("Invalid card value: " + value);
    }
    this.rank = new Rank(value[0]);
    this.suit = new Suit(value[1]);
  }

  static fromIndex(index: number): Card {
    const card = cards[index];
    if (!card) throw new Error("Invalid card index: " + index);
    return new Card(card);
  }

  index() {
    return cards.indexOf(this.value);
  }

  toString() {
    return `${this.rank}${this.suit}`;
  }

  static comparator(a: Card, b: Card): number {
    return a.index() - b.index();
  }
}

export const AllCards = cards.map((c) => new Card(c));

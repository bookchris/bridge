import { Hand } from "./hand";
import { Seat } from "./seat";
import { Suit } from "./suit";

export function holdingsToPbnDeal(hand: Hand, position = Seat.North): string {
  const holdings: string[] = [];
  for (let i = 0; i < 4; i++) {
    const cards = hand.getHolding(position.next(i));
    const suitStrs: string[] = [];
    for (const suit of [Suit.Spade, Suit.Heart, Suit.Diamond, Suit.Club]) {
      suitStrs.push(
        cards
          .filter((c) => c.suit.index() === suit.index())
          .map((c) => c.rankStr)
          .join("")
      );
    }
    holdings.push(suitStrs.join("."));
  }
  return `${position.toChar()}:${holdings.join(" ")}`;
}

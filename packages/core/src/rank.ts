const ranks = "23456789TJQKA";

export class Rank {
  constructor(public readonly value: string) {
    if (!ranks.includes(value)) {
      throw new Error("Invalid value passed to Rank: " + value);
    }
  }

  toString() {
    return this.value;
  }

  index() {
    return ranks.indexOf(this.value);
  }
}

export const AllRanks = ranks.split("").map((r) => new Rank(r));

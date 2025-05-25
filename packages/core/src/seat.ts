const seats = ["South", "West", "North", "East"];

export class Seat {
  public static South = new Seat("South");
  public static West = new Seat("West");
  public static North = new Seat("North");
  public static East = new Seat("East");

  constructor(public readonly value: string) {
    if (!seats.includes(value)) {
      throw new Error("Invalid value passed to Seat: " + value);
    }
  }

  static fromChar(c: string): Seat {
    const value = seats.find((s) => s[0] === c);
    if (!value) throw new Error("Invalid seat character: " + c);
    return new Seat(value);
  }

  toChar(): string {
    return this.value[0];
  }

  toString(): string {
    return this.value;
  }

  index(): number {
    return seats.indexOf(this.value);
  }

  teamIndex(): number {
    return seats.indexOf(this.value) % 2;
  }

  next(num = 1): Seat {
    return new Seat(seats[(this.index() + num) % 4]);
  }

  partner(): Seat {
    return this.next(2);
  }

  equals(seat: Seat) {
    return this.value === seat.value;
  }

  isTeam(seat: Seat) {
    return this.equals(seat) || this.partner().equals(seat);
  }
}

export const AllSeats = seats.map((s) => new Seat(s));

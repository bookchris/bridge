import { Bid } from "./bid";
import { Seat } from "./seat";

export class Auction {
  constructor(
    public readonly bids: Bid[],
    public readonly dealer: Seat
  ) {}
}

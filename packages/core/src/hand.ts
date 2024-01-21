import { Bid } from "./bid";
import { Card } from "./card";
import { Contract } from "./contract";
import { linToHand } from "./lin";
import { Seat } from "./seat";
import { Suit } from "./suit";
import { Trick } from "./trick";
import { Vulnerability } from "./vulnerability";

export type HandJson = {
  board?: number;
  dealer?: string;
  vulnerability?: string;
  deal?: number[];
  bidding?: string[];
  play?: number[];
  players?: string[];
  claim?: number;
};

export class Hand {
  readonly board: number;
  readonly dealer: Seat;
  readonly vulnerability: Vulnerability;
  readonly deal: Card[];
  readonly bidding: Bid[];
  readonly play: Card[];
  readonly claim: number;
  readonly players: string[];
  constructor(
    props:
      | Hand
      | {
          board: number;
          dealer: Seat;
          vulnerability: Vulnerability;
          deal: Card[];
          bidding: Bid[];
          play: Card[];
          claim: number;
          players: string[];
        }
  ) {
    this.board = props.board;
    this.dealer = props.dealer;
    this.vulnerability = props.vulnerability;
    this.deal = props.deal;
    this.bidding = props.bidding;
    this.play = props.play;
    this.claim = props.claim;
    this.players = props.players;
  }

  static fromJson(data: HandJson): Hand {
    const dataPlayers = data.players || [];
    const players = ["South", "West", "North", "East"];
    players.splice(0, dataPlayers.length, ...dataPlayers);

    return new Hand({
      board: data.board || -1,
      dealer: Seat.fromString(data.dealer || ""),
      vulnerability: Vulnerability.fromString(data.vulnerability || ""),
      deal: data.deal?.map((c) => new Card(c)) || [],
      bidding: data.bidding?.map((b) => new Bid(b)) || [],
      play: data.play?.map((c) => new Card(c)) || [],
      claim: data.claim || -1,
      players,
    });
  }

  static fromLin(url: string): Hand {
    return linToHand(url);
  }

  static fromDeal(): Hand {
    const cards = Array.from({ length: 52 }, (_, i) => i);
    const deal = [] as number[];
    for (let i = 0; i < 52; i++) {
      const index = Math.floor(Math.random() * cards.length);
      const card = cards[index];
      cards.splice(index, 1);
      deal.push(card);
    }

    return this.fromJson({
      deal: deal,
    });
  }

  toJson(): HandJson {
    return {
      board: this.board,
      dealer: this.dealer.toJson(),
      vulnerability: this.vulnerability.toJson(),
      deal: this.deal.map((c) => c.toJson()),
      bidding: this.bidding.map((b) => b.toJson()),
      play: this.play.map((c) => c.toJson()),
      players: this.players,
      claim: this.claim,
    };
  }

  getDeal(seat: Seat): Card[] {
    if (this.deal.length != 52) {
      return [];
    }
    const offset = 13 * seat.index();
    return this.deal
      .slice(offset, offset + 13)
      .sort(Card.comparator)
      .reverse();
  }

  getHolding(seat: Seat): Card[] {
    return this.getDeal(seat).filter(
      (c) => !this.play.find((p) => p.id === c.id)
    );
  }

  get north() {
    return this.getHolding(Seat.North);
  }

  get south() {
    return this.getHolding(Seat.South);
  }

  get east() {
    return this.getHolding(Seat.East);
  }

  get west() {
    return this.getHolding(Seat.West);
  }

  get nextBidder() {
    return this.dealer.next(this.contract.bids.length);
  }

  get state() {
    if (this.contract.passed) {
      return HandState.Complete;
    }
    if (!this.contract.complete) {
      return HandState.Bidding;
    }
    if (this.claim !== -1) return HandState.Complete;
    if (this.play?.length === 52) return HandState.Complete;
    return HandState.Playing;
  }

  get isPlaying() {
    return this.state === HandState.Playing;
  }

  get isBidding() {
    return this.state === HandState.Bidding;
  }

  get openingLeader() {
    return this.contract.declarer ? this.contract.declarer.next() : undefined;
  }

  get northSouthTricks() {
    return this.tricks.filter(
      (t) => t.winningSeat === Seat.North || t.winningSeat === Seat.South
    ).length;
  }

  get eastWestTricks() {
    return this.tricks.filter(
      (t) => t.winningSeat === Seat.East || t.winningSeat === Seat.West
    ).length;
  }

  get declarerTricks() {
    return this.tricks.filter(
      (t) =>
        t.winningSeat === this.contract.declarer ||
        t.winningSeat === this.contract.declarer?.partner()
    );
  }

  get result() {
    if (this.state !== HandState.Complete || !this.contract.suitBid?.level) {
      return 0;
    }
    let tricks = 0;
    if (this.claim !== -1) {
      tricks = this.claim;
    } else {
      tricks =
        this.contract.declarer == Seat.North ||
        this.contract.declarer == Seat.South
          ? this.northSouthTricks
          : this.eastWestTricks;
    }
    return tricks - (6 + this.contract.suitBid.level);
  }

  get score() {
    if (this.state !== HandState.Complete || this.contract.passed) {
      return 0;
    }
    const result = this.result;
    const declarer = this.contract.declarer;
    if (!declarer) throw new Error("unexpected empty declarer");
    const vulnerable = this.vulnerability.isVulnerable(declarer);
    if (result < 0) {
      if (this.contract.doubled || this.contract.redoubled) {
        let score: number;
        if (vulnerable) {
          score = [
            0, -200, -500, -800, -1100, -1400, -1700, -2000, -2300, -2600,
            -2900, -3200, -3500, -3800,
          ][-result];
        } else {
          score = [
            0, -100, -300, -500, -800, -1100, -1400, -1700, -2000, -2300, -2600,
            -2900, -3200, -3500,
          ][-result];
        }
        if (this.contract.redoubled) {
          score *= 2;
        }
        return score;
      } else if (vulnerable) {
        return result * 100;
      } else {
        return result * 10;
      }
    }
    let score = 0;
    const level = this.contract.suitBid?.level || 0;
    switch (this.contract.suitBid?.suit) {
      case Suit.Spade:
      case Suit.Heart:
        score = level * 30;
        break;
      case Suit.Diamond:
      case Suit.Club:
        score = level * 20;
        break;
      case Suit.NoTrump:
        score = level * 30 + 10;
    }
    if (this.contract.doubled) {
      score *= 2;
    } else if (this.contract.redoubled) {
      score *= 4;
    }
    if (score < 100) {
      score += 50;
    } else {
      score += vulnerable ? 500 : 300;
      if (this.contract.suitBid?.level === 7) {
        score += vulnerable ? 1500 : 1000;
      } else if (this.contract.suitBid?.level === 6) {
        score += vulnerable ? 750 : 500;
      }
    }
    if (this.contract.doubled) {
      score += 50;
    } else if (this.contract.redoubled) {
      score += 100;
    }
    if (result > 0) {
      if (this.contract.doubled) {
        score += result * (vulnerable ? 200 : 100);
      } else if (this.contract.redoubled) {
        score += result * (vulnerable ? 400 : 200);
      } else {
        switch (this.contract.suitBid?.suit) {
          case Suit.NoTrump:
          case Suit.Spade:
          case Suit.Heart:
            score += result * 30;
            break;
          case Suit.Diamond:
          case Suit.Club:
            score += result * 20;
            break;
        }
      }
    }
    return score;
  }

  scoreAs(seat: Seat) {
    if (!this.contract.declarer) return 0;
    return seat.isTeam(this.contract.declarer) ? this.score : this.score * -1;
  }

  get player() {
    const tricks = this.tricks;
    if (!tricks.length) {
      return this.openingLeader;
    }
    return tricks[tricks.length - 1].player;
  }

  get turn() {
    if (this.isBidding) {
      return this.nextBidder;
    }
    if (this.isPlaying) {
      return this.player;
    }
    return undefined;
  }

  isDummy(seat: Seat): boolean {
    return this.play.length >= 1 && this.contract.declarer?.partner() === seat;
  }

  get contract() {
    return new Contract(this.bidding, this.dealer);
  }

  get tricks() {
    const trump = this.contract.suitBid?.suit;
    if (!trump) {
      return [];
    }
    if (!this.openingLeader) {
      return [];
    }
    let leader = this.openingLeader;
    const tricks = [] as Trick[];
    for (let i = 0; i < this.play.length; i += 4) {
      const cards = this.play.slice(i, i + 4);
      const trick = new Trick(leader, cards, trump);
      if (trick.winningSeat) {
        leader = trick.winningSeat;
      }
      tricks.push(trick);
    }
    return tricks;
  }

  setPlayer(seat: Seat, player: string): Hand {
    const players = this.players;
    players[seat.index()] = player;
    return new Hand({
      ...this,
      players,
    });
  }

  get positions() {
    return this.contract.bids.length + this.play.length;
  }

  previousTurn(pos: number) {
    if (pos < 0 || pos >= this.positions) {
      return -1;
    }
    const seat = this.atPosition(pos).turn;
    if (!seat) return -1;

    while (pos > 0) {
      pos -= 1;
      if (this.atPosition(pos).turn === seat) {
        return pos;
      }
    }
    return -1;
  }

  nextTurn(pos: number) {
    if (pos < 0 || pos >= this.positions) {
      return -1;
    }
    const seat = this.atPosition(pos).turn;
    if (!seat) return -1;

    while (pos < this.positions) {
      pos += 1;
      if (this.atPosition(pos).turn === seat) {
        return pos;
      }
    }
    return -1;
  }

  atPosition(pos: number): Hand {
    if (pos < 0) {
      return this;
    }
    if (pos >= this.play.length + this.bidding.length) {
      return this;
    }

    const bids = this.bidding.slice(0, pos);
    const play = bids.length < pos ? this.play.slice(0, pos - bids.length) : [];

    return new Hand({
      ...this,
      bidding: bids,
      play,
      claim: pos == this.positions ? this.claim : -1,
    });
  }

  lastAction(): Bid | Card {
    if (this.play.length) {
      return this.play[this.play.length - 1];
    }
    if (this.bidding.length) {
      return this.bidding[this.bidding.length - 1];
    }
    throw new Error("No past actions");
  }

  isEquivalent(hand: Hand) {
    if (this.deal.length != hand.deal.length) {
      return false;
    }
    if (this.bidding.length != hand.bidding.length) {
      return false;
    }
    if (this.play.length != hand.play.length) {
      return false;
    }
    for (const i in this.deal) {
      if (this.deal[i].id !== hand.deal[i].id) {
        return false;
      }
    }
    for (const i in this.bidding) {
      if (this.bidding[i].bid !== hand.bidding[i].bid) {
        return false;
      }
    }
    for (const i in this.play) {
      if (this.play[i].id !== hand.play[i].id) {
        return false;
      }
    }
    return true;
  }

  canBid(bid: Bid, seat: Seat) {
    if (!this.isBidding) return false;
    if (this.nextBidder != seat) return false;
    return this.contract.canBid(bid);
  }

  doBid(bid: Bid, seat: Seat): Hand | undefined {
    if (!this.canBid(bid, seat)) {
      return undefined;
    }
    return new Hand({
      ...this,
      bidding: [...this.bidding, bid],
    });
  }

  canPlay(card: Card, seat: Seat) {
    if (!this.isPlaying) return false;

    const player = this.player;
    if (!player) return false;

    if (this.isDummy(player)) {
      seat = seat.partner();
    }
    if (player != seat) return false;

    const holding = this.getHolding(player);
    if (!holding.find((c) => c.id === card.id)) return false;

    const lastTrick = this.tricks.at(-1);
    if (lastTrick && !lastTrick.complete) {
      const lead = lastTrick.cards[0];
      if (
        card.suit !== lead.suit &&
        holding.filter((c) => c.suit === lead.suit).length
      )
        return false;
    }
    return true;
  }

  doPlay(card: Card, seat: Seat): Hand | undefined {
    if (!this.canPlay(card, seat)) {
      return undefined;
    }
    return new Hand({
      ...this,
      play: [...this.play, card],
    });
  }
}

export enum HandState {
  Bidding,
  Playing,
  Complete,
}

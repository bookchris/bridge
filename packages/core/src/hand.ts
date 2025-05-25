import { Bid } from "./bid";
import { AllCards, Card } from "./card";
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
  deal?: string[];
  bidding?: string[];
  play?: string[];
  players?: string[];
  claim?: number;
};

export class Hand {
  // Input
  readonly board: number;
  readonly dealer: Seat;
  readonly vulnerability: Vulnerability;
  readonly deal: Card[];
  readonly bidding: Bid[];
  readonly play: Card[];
  readonly claim: number;
  readonly players: string[];

  // Computed state.
  readonly isPassedOut: boolean;
  readonly state: HandState;
  readonly contract: Contract | undefined;

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

    this.isPassedOut =
      this.bidding.length === 4 &&
      !this.bidding.find((x) => x.value !== Bid.Pass.value);

    if (!this.isPassedOut && this.bidding.length > 3) {
      const firstMap = [new Map<string, Seat>(), new Map<string, Seat>()];
      let suitBid: { suit: Suit; level: number } | undefined;
      let seat: Seat | undefined;
      let doubled = "";
      this.bidding.forEach((bid, i) => {
        const bidder = this.dealer.next(i);
        if (bid.suitBid) {
          suitBid = bid.suitBid;
          doubled = "";

          let s = firstMap[bidder.teamIndex()].get(suitBid.suit.value);
          if (!s) {
            s = bidder;
            firstMap[bidder.teamIndex()].set(suitBid.suit.value, bidder);
          }
          seat = s;
        }
        if (
          bid.value === Bid.Double.value ||
          bid.value === Bid.Redouble.value
        ) {
          doubled = bid.value;
        }
      });
      if (
        suitBid &&
        seat &&
        this.bidding.at(-1)?.equals(Bid.Pass) &&
        this.bidding.at(-2)?.equals(Bid.Pass) &&
        this.bidding.at(-3)?.equals(Bid.Pass)
      ) {
        this.contract = new Contract(
          `${suitBid.level}${suitBid.suit.value}${seat.toChar()}${doubled}`
        );
      }
    }

    if (this.isPassedOut || this.claim !== -1 || this.play.length === 52) {
      this.state = HandState.Complete;
    } else if (!this.contract) {
      this.state = HandState.Bidding;
    } else {
      this.state = HandState.Playing;
    }
  }

  static fromJson(data: HandJson): Hand {
    const dataPlayers = data.players || [];
    const players = ["South", "West", "North", "East"];
    players.splice(0, dataPlayers.length, ...dataPlayers);

    return new Hand({
      board: data.board || -1,
      dealer: new Seat(data.dealer || ""),
      vulnerability: new Vulnerability(data.vulnerability || ""),
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
      deal: deal.map((i) => AllCards[i].value),
    });
  }

  toJson(): HandJson {
    return {
      board: this.board,
      dealer: this.dealer.value,
      vulnerability: this.vulnerability.value,
      deal: this.deal.map((c) => c.value),
      bidding: this.bidding.map((b) => b.value),
      play: this.play.map((c) => c.value),
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
      (c) => !this.play.find((p) => p.value === c.value)
    );
  }

  getSeatPlayer(seat: Seat) {
    return this.players[seat.index()];
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
    return this.dealer.next(this.bidding.length);
  }

  get isPlaying() {
    return this.state === HandState.Playing;
  }

  get isBidding() {
    return this.state === HandState.Bidding;
  }

  get openingLeader() {
    if (!this.contract) {
      throw new Error("opening leader requires contract");
    }
    return this.contract.seat.next();
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
    const contract = this.contract;
    if (!contract) {
      throw new Error("declarerTricks requires a contract");
    }
    return this.tricks.filter(
      (t) =>
        t.winningSeat === contract.seat ||
        t.winningSeat === contract.seat.partner()
    );
  }

  get result() {
    if (this.state !== HandState.Complete || !this.contract) {
      return 0;
    }
    let tricks = 0;
    if (this.claim !== -1) {
      tricks = this.claim;
    } else {
      tricks =
        this.contract.seat == Seat.North || this.contract.seat == Seat.South
          ? this.northSouthTricks
          : this.eastWestTricks;
    }
    return tricks - (6 + this.contract.level);
  }

  get score() {
    if (this.state !== HandState.Complete || !this.contract) {
      return 0;
    }
    const result = this.result;
    const declarer = this.contract.seat;
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
    const level = this.contract.level || 0;
    switch (this.contract.suit) {
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
      if (this.contract.level === 7) {
        score += vulnerable ? 1500 : 1000;
      } else if (this.contract.level === 6) {
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
        switch (this.contract.suit) {
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
    const declarer = this.contract?.seat;
    if (!declarer) return 0;
    return seat.isTeam(declarer) ? this.score : this.score * -1;
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
    return this.play.length >= 1 && this.contract?.seat.partner() === seat;
  }

  get tricks() {
    if (!this.contract) {
      return [];
    }
    const trump = this.contract.suit;
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
    return this.bidding.length + this.play.length;
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
      if (this.deal[i].value !== hand.deal[i].value) {
        return false;
      }
    }
    for (const i in this.bidding) {
      if (this.bidding[i].value !== hand.bidding[i].value) {
        return false;
      }
    }
    for (const i in this.play) {
      if (this.play[i].value !== hand.play[i].value) {
        return false;
      }
    }
    return true;
  }

  canBid(bid: Bid, seat: Seat) {
    if (!this.isBidding) return false;
    if (this.nextBidder != seat) return false;

    let opponentBid: Bid | undefined;
    if (this.bidding.length && !this.bidding[-1].equals(Bid.Pass)) {
      opponentBid = this.bidding[-1];
    } else if (
      this.bidding.length >= 3 &&
      this.bidding.at(-1)?.equals(Bid.Pass) &&
      this.bidding.at(-2)?.equals(Bid.Pass) &&
      !this.bidding.at(-3)?.equals(Bid.Pass)
    ) {
      opponentBid = this.bidding.at(-3);
    }

    const lastSuitBid: Bid | undefined = [...this.bidding]
      .reverse()
      .find((bid) => bid.suitBid);

    /*
    function canDouble() {
      return !!this.pendingOpponentBid?.suit;
    }

    function canRedouble() {
      return this.pendingOpponentBid?.bid === "X";
    }
    */

    if (bid.equals(Bid.Pass)) return true;
    if (bid.equals(Bid.Double)) return !!opponentBid?.suitBid;
    if (bid.equals(Bid.Redouble)) return !!opponentBid?.equals(Bid.Double);
    if (!lastSuitBid) {
      return true;
    }
    return bid.suitIndex() > lastSuitBid.suitIndex();
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

  /*
  tryPlay(card: Card, seat?: Seat) {
    if (!this.isPlaying) throw new Error("hand is not in playing state");

    const player = this.player;
    if (!player) throw new Error("hand has no active player");

    if (seat && this.isDummy(player)) {
      seat = seat.partner();
    }
    if (seat && player != seat) throw new Error(`it is not ${seat}'s turn`);

    const holding = this.getHolding(player);
    if (!holding.find((c) => c.value === card.value))
      return `${seat} does not have card ${card}`;

    const lastTrick = this.tricks.at(-1);
    if (lastTrick && !lastTrick.complete) {
      const lead = lastTrick.cards[0];
      if (
        card.suit !== lead.suit &&
        holding.filter((c) => c.suit === lead.suit).length
      )
        return "must follow suit";
    }
    return;
  }
    */

  canPlay(card: Card, seat?: Seat): boolean {
    try {
      this.doPlay(card, seat);
      return true;
    } catch (e: unknown) {
      return false;
    }
  }

  doPlay(card: Card, seat?: Seat): Hand {
    if (!this.isPlaying) throw new Error("hand is not in a playing state");

    const player = this.player;
    if (!player) throw new Error("no current player");

    if (seat && this.isDummy(player)) {
      seat = seat.partner();
    }
    if (seat && player != seat) throw new Error(`not ${player.value}'s turn`);

    const holding = this.getHolding(player);
    if (!holding.find((c) => c.value === card.value))
      throw new Error(
        `player ${player.value} does not have card ${card.value}`
      );

    const lastTrick = this.tricks.at(-1);
    if (lastTrick && !lastTrick.complete) {
      const lead = lastTrick.cards[0];
      if (
        card.suit !== lead.suit &&
        holding.filter((c) => c.suit === lead.suit).length
      )
        throw new Error(
          `card ${card.value} doesn't follow suit lead ${lead.suit.value}`
        );
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

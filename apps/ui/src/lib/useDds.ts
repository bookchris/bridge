import {
  Card,
  Hand,
  holdingsToPbnDeal,
  pbnFromSuit,
  Seat,
  Suit,
  Vulnerability,
} from "@bridge/core";
import {
  Dds,
  DdTableResults,
  FutureTricks,
  ParResultsDealer,
  SolvedPlay,
  Vulnerable,
} from "bridge-dds";
import * as Comlink from "comlink";
import { createContext, useContext, useEffect, useRef, useState } from "react";

class DdsApi {
  private worker: Comlink.Remote<Dds> = Comlink.wrap<Dds>(
    new Worker(new URL("../worker.ts", import.meta.url), {
      type: "module",
    })
  );

  async ddsSolveHand(hand: Hand): Promise<Solution | undefined> {
    if (!hand.isPlaying) {
      return undefined;
    }
    let leader = hand.openingLeader;
    if (!leader) return undefined;

    const player = hand.player;
    if (!player) return undefined;

    const level = hand.contract.suitBid?.level;
    if (!level) return undefined;

    const trump = hand.contract.suitBid?.suit?.value;
    if (!trump) return undefined;

    const declarer = hand.contract.declarer;
    if (!declarer) return undefined;

    const declarerTricks = hand.declarerTricks.length;

    const tricks = hand.tricks;
    const lastTrick = tricks.at(-1);
    const played: Card[] = [];
    if (lastTrick) {
      if (!lastTrick.complete) {
        leader = lastTrick.leader;
        for (const card of lastTrick.cards) {
          played.push(card);
        }
      } else {
        leader = lastTrick.winningSeat;
      }
    }
    const pbn = holdingsToPbnDeal(hand, Seat.North);

    let futureTricks: FutureTricks;
    try {
      const dealPbn = {
        trump: suit_to_dds(trump),
        first: dir_to_dds(leader.toChar()),
        currentTrickRank: played.map((c) => rank_to_dds(c.rank.value)),
        currentTrickSuit: played.map((c) => suit_to_dds(c.suit.value)),
        remainCards: pbn,
      };
      futureTricks = await this.worker.SolveBoardPBN(dealPbn, -1, 3, 1);
    } catch (e: unknown) {
      console.log("dds error", e);
      return undefined;
    }

    const newSolution: Solution = {};
    const relativeScore = (score: number) => {
      const need = level + 6 - declarerTricks;
      const remaining = 13 - Math.floor(hand.play.length / 4);
      return player.isTeam(declarer) ? score - need : remaining - score - need;
    };
    for (let i = 0; i < futureTricks.cards; i++) {
      const suit = futureTricks.suit[i];
      const rank = futureTricks.rank[i];
      let score = futureTricks.score[i];
      if (score < 0) {
        throw new Error("position not reached: " + score);
      }
      const equals = futureTricks.equals[i];
      newSolution[new Card(dds_to_rank(rank) + dds_to_suit(suit)).value] =
        relativeScore(score);
      for (const eq of dds_to_ranks(equals)) {
        newSolution[new Card(eq + dds_to_suit(suit)).value] =
          relativeScore(score);
      }
    }

    return newSolution;
  }

  async ddsAnalysePlay(hand: Hand): Promise<PlayAnalysis | undefined> {
    const handAt = hand.atPosition(hand.bidding.length);

    let leader = hand.openingLeader;
    if (!leader) return undefined;

    const player = hand.player;
    if (!player) return undefined;

    const level = hand.contract.suitBid?.level;
    if (!level) return undefined;

    const trump = hand.contract.suitBid?.suit?.value;
    if (!trump) return undefined;

    const declarer = hand.contract.declarer;
    if (!declarer) return undefined;

    const pbn = holdingsToPbnDeal(handAt, Seat.North);

    let solvedPlay: SolvedPlay;
    try {
      const dealPbn = {
        trump: suit_to_dds(trump),
        first: dir_to_dds(leader.toChar()),
        currentTrickRank: [],
        currentTrickSuit: [],
        remainCards: pbn,
      };
      const playTracePbn = {
        cards: hand.play
          .map((card) => `${pbnFromSuit(card.suit)}${card.rank}`)
          .join(""),
      };
      solvedPlay = await this.worker.AnalysePlayPBN(dealPbn, playTracePbn);
    } catch (e: unknown) {
      return undefined;
    }

    return { tricks: solvedPlay.tricks };
  }

  async ddsCalcTable(hand: Hand): Promise<DoubleDummyTableAndPar | undefined> {
    const handAt = hand.atPosition(hand.bidding.length);
    const pbn = holdingsToPbnDeal(handAt, Seat.North);

    let ddTableResults: DdTableResults;
    let parResultsDealer: ParResultsDealer;
    try {
      ddTableResults = await this.worker.CalcDDTablePBN({
        cards: pbn,
      });
      parResultsDealer = await this.worker.DealerPar(
        ddTableResults,
        dir_to_dds(hand.dealer.toChar()),
        vul_to_dds(hand.vulnerability)
      );
    } catch (e: unknown) {
      console.log("dds error", e);
      return undefined;
    }

    return {
      table: Object.fromEntries(
        ddTableResults.resTable.map((suits, i) => [
          dds_to_suit(i),
          Object.fromEntries(suits.map((tricks, j) => [dds_to_dir(j), tricks])),
        ])
      ),
      par: parResultsDealer,
    };
  }
}

const ddsContext = createContext(new DdsApi());

export function useDds() {
  return useContext(ddsContext);
}

export interface Solution {
  [id: number]: number;
}

export interface PlayAnalysis {
  tricks: number[];
}

export interface DoubleDummyTableAndPar {
  table: { [suit: string]: { [seat: string]: number } };
  par: {
    score: number;
    contracts: string[];
  };
}

export function useDdsSolveHand(hand: Hand): Solution | undefined {
  const api = useDds();
  const [solution, setSolution] = useState<Solution>();
  const current = useRef<Hand>();
  current.current = hand;
  useEffect(() => {
    setSolution(undefined);
    api.ddsSolveHand(hand).then((s) => {
      if (current.current === hand) {
        setSolution(s);
      }
    });
  }, [hand]);
  return solution;
}

function rank_to_dds(rank: string): number {
  switch (rank) {
    case "T":
      return 10;
    case "J":
      return 11;
    case "Q":
      return 12;
    case "K":
      return 13;
    case "A":
      return 14;
    default:
      return Number(rank);
  }
}

function dds_to_rank(rank: number): string {
  switch (rank) {
    case 10:
      return "T";
    case 11:
      return "J";
    case 12:
      return "Q";
    case 13:
      return "K";
    case 14:
      return "A";
    default:
      return String(rank);
  }
}

function dds_to_ranks(ranks: number): string[] {
  const resp: string[] = [];
  for (let rank = 1; rank <= 14; rank++) {
    if ((1 << rank) & ranks) {
      resp.push(dds_to_rank(rank));
    }
  }
  return resp;
}

function suit_to_dds(suit: string): number {
  const suits = [
    Suit.Spade.value,
    Suit.Heart.value,
    Suit.Diamond.value,
    Suit.Club.value,
    Suit.NoTrump.value,
  ];
  return suits.indexOf(suit);
}

function dds_to_suit(suit: number): string {
  const suits = [
    Suit.Spade.value,
    Suit.Heart.value,
    Suit.Diamond.value,
    Suit.Club.value,
    Suit.NoTrump.value,
  ];
  return suits[suit];
}

function dir_to_dds(dir: string): number {
  const dirs = ["N", "E", "S", "W"];
  return dirs.indexOf(dir);
}

function dds_to_dir(dir: number): string {
  const dirs = ["N", "E", "S", "W"];
  return dirs[dir];
}

function vul_to_dds(vul: Vulnerability): number {
  if (vul.equals(Vulnerability.NorthSouth)) {
    return Vulnerable.NorthSouth;
  }
  if (vul.equals(Vulnerability.EastWest)) {
    return Vulnerable.EastWest;
  }
  if (vul.equals(Vulnerability.All)) {
    return Vulnerable.Both;
  }
  return Vulnerable.None;
}

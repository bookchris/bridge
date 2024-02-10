import { Card, Hand, holdingsToPbnDeal } from "@bridge/core";
import { Dds, FutureTricks } from "bridge-dds";
import * as Comlink from "comlink";
import { createContext, useContext, useEffect, useRef, useState } from "react";

class DdsApi {
  private worker: Comlink.Remote<Dds> = Comlink.wrap<Dds>(
    new Worker(new URL("../worker", import.meta.url), {
      type: "module",
    })
  );

  async handToDds(hand: Hand): Promise<Solution | undefined> {
    if (!hand.isPlaying) {
      return undefined;
    }
    let leader = hand.openingLeader;
    if (!leader) return undefined;

    const player = hand.player;
    if (!player) return undefined;

    const level = hand.contract.suitBid?.level;
    if (!level) return undefined;

    const trump = hand.contract.suitBid?.suit?.toPbn();
    if (!trump) return undefined;

    const declarer = hand.contract.declarer;
    if (!declarer) return undefined;

    const declarerTricks = hand.declarerTricks.length;

    const tricks = hand.tricks;
    const lastTrick = tricks.at(-1);
    const played: string[] = [];
    if (lastTrick) {
      if (!lastTrick.complete) {
        leader = lastTrick.leader;
        for (const card of lastTrick.cards) {
          played.push(card.toPbn());
        }
      } else {
        leader = lastTrick.winningSeat;
      }
    }
    const pbn = holdingsToPbnDeal(hand, declarer);

    let futureTricks: FutureTricks;
    try {
      const dealPbn = {
        trump: suit_to_dds(trump),
        first: dir_to_dds(leader.toChar()),
        currentTrickRank: played.map((c) => rank_to_dds(c[0])),
        currentTrickSuit: played.map((c) => suit_to_dds(c[1])),
        remainCards: pbn,
      };
      futureTricks = await this.worker.SolveBoardPBN(dealPbn, -1, 3, 2);
      if (hand.play.length == 1) {
        console.log(
          `${hand.play.length}`,
          JSON.stringify(dealPbn),
          JSON.stringify(futureTricks)
        );
      }
      console.log();
    } catch (e: unknown) {
      console.log("dds error", e);
      return {};
    }

    //const o = nextPlays(pbn, trump, played);
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
      newSolution[Card.parse(dds_to_suit(suit) + dds_to_rank(rank)).id] =
        relativeScore(score);
      for (const eq of dds_to_ranks(equals)) {
        newSolution[Card.parse(dds_to_suit(suit) + eq).id] =
          relativeScore(score);
      }
    }

    return newSolution;
  }

  async handToDdsMax(hand: Hand): Promise<number | undefined> {
    const solution = await this.handToDds(hand);
    if (!solution) return undefined;
    const declarer = hand.contract.declarer;
    if (!declarer) return undefined;
    if (hand.player?.isTeam(declarer)) {
      return Math.max(...Object.values(solution));
    }
    return Math.min(...Object.values(solution));
  }
}

const ddsContext = createContext(new DdsApi());

export function useDds() {
  return useContext(ddsContext);
}

export interface Solution {
  [id: number]: number;
}

export function useDdsHand(hand: Hand): Solution | undefined {
  const api = useDds();
  const [solution, setSolution] = useState<Solution>();
  const current = useRef<Hand>();
  current.current = hand;
  useEffect(() => {
    setSolution(undefined);
    api.handToDds(hand).then((s) => {
      if (current.current === hand) {
        setSolution(s);
      }
    });
  }, [hand]);
  return solution;
}

export function useDdsMax(hand: Hand): number | undefined {
  const api = useDds();
  const [solution, setSolution] = useState<number>();
  const current = useRef<Hand>();
  current.current = hand;
  useEffect(() => {
    setSolution(undefined);
    api.handToDdsMax(hand).then((s) => {
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
  const suits = ["S", "H", "D", "C", "N"];
  return suits.indexOf(suit);
}

function dds_to_suit(suit: number): string {
  const suits = ["S", "H", "D", "C", "N"];
  return suits[suit];
}

function dir_to_dds(dir: string): number {
  const dirs = ["N", "E", "S", "W"];
  return dirs.indexOf(dir);
}

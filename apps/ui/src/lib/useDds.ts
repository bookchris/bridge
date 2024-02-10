import { Card, Hand, holdingsToPbnDeal } from "@bridge/core";
import { useMemo } from "react";

declare const nextPlays: (
  board: string,
  trump: string,
  plays: string[]
) =>
  | {
      plays: {
        suit: string;
        rank: string;
        score: number;
        equals: string[];
      }[];
    }
  | {
      error: number;
      message: string;
    };

export interface Solution {
  [id: number]: number;
}

export function useDds(hand: Hand): Solution | undefined {
  return useMemo(() => handToDds(hand), [hand]);
}

export function useDdsMax(hand: Hand): number | undefined {
  return useMemo(() => handToDdsMax(hand), [hand]);
}

export function handToDds(hand: Hand): Solution | undefined {
  if (!nextPlays) return undefined;
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
  const lastTrickHand = hand.atPosition(hand.positions - played.length);
  const pbn = holdingsToPbnDeal(lastTrickHand, leader);
  const o = nextPlays(pbn, trump, played);
  const newSolution: Solution = {};
  const relativeScore = (score: number) => {
    const need = level + 6 - declarerTricks;
    const remaining = 13 - Math.floor(hand.play.length / 4);
    return player.isTeam(declarer) ? score - need : remaining - score - need;
  };
  if ("error" in o) {
    console.log("dds error", o.message);
    return {};
  }
  for (const play of o.plays) {
    newSolution[Card.parse(play.suit + play.rank).id] = relativeScore(
      play.score
    );
    for (const eq of play.equals) {
      newSolution[Card.parse(play.suit + eq).id] = relativeScore(play.score);
    }
  }
  return newSolution;
}

export function handToDdsMax(hand: Hand): number | undefined {
  const solution = handToDds(hand);
  if (!solution) return undefined;
  const declarer = hand.contract.declarer;
  if (!declarer) return undefined;
  if (hand.player?.isTeam(declarer)) {
    return Math.max(...Object.values(solution));
  }
  return Math.min(...Object.values(solution));
}

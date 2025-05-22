import { Card } from "./card";
import { Hand, HandJson } from "./hand";
import { Seat } from "./seat";
import { AllSuits, Suit } from "./suit";
import { Vulnerability } from "./vulnerability";

export const linToHand = (data: string): Hand => {
  let url: URL;
  try {
    url = new URL(data);
  } catch (_) {
    throw new Error("Not a valid URL");
  }
  const lin = url.searchParams.get("lin");
  if (!lin) {
    throw new Error("No lin foud in URL");
  }
  const line = lin.split("\n")[0].trim();
  const terms = line.split("|");

  const json: HandJson = {};

  while (terms.length >= 2) {
    const [key, value] = terms;
    terms.splice(0, 2);
    switch (key) {
      case "md": {
        json.dealer = linToSeat(value[0]).value;
        const linHands = value.substring(1).split(",");
        if (linHands.length !== 4) {
          continue;
        }
        const hands = linHands.map((linHand) => {
          const hand: string[] = [];
          ["C", "D", "H", "S"].forEach((s) => {
            const suit = linToSuit(s);
            const start = linHand.indexOf(s) + 1;
            if (start === 0) return;
            let end = linHand.substring(start).search(/[SHDC]/) + start;
            if (end === start - 1) {
              end = linHand.length;
            }
            const ranks = linHand.substring(start, end);
            for (const rank of ranks) {
              hand.push(new Card(`${rank}${suit}`).value);
            }
          });
          return hand;
        });
        json.deal = ([] as string[]).concat(
          hands[0],
          hands[1],
          hands[2],
          hands[3]
        );
        break;
      }
      case "sv":
        json.vulnerability = linToVulnerability(value).value;
        break;
      case "mb": {
        const bid = linToBid(value);
        if (!json.bidding) {
          json.bidding = [];
        }
        json.bidding.push(bid);
        break;
      }
      case "pc": {
        const suit = linToSuit(value[0]);
        const rank = value[1];
        if (!json.play) {
          json.play = [];
        }
        json.play.push(new Card(`${rank}${suit}`).value);
        break;
      }
      case "pn": {
        const players = value.split(",");
        if (players.length == 4) {
          json.players = players;
        }
        break;
      }
      case "mc": {
        const claim = parseInt(value);
        if (!isNaN(claim) && claim >= 0 && claim <= 13) {
          json.claim = claim;
        }
        break;
      }
      case "ah": {
        const board = parseInt(value.split(" ").at(-1) || "");
        if (!isNaN(board)) {
          json.board = board;
        }
        break;
      }
      default:
    }
  }
  return Hand.fromJson(json);
};

/*
function linCardToRank(c: string) {
  switch (c) {
    case "A":
      return 12;
    case "K":
      return 11;
    case "Q":
      return 10;
    case "J":
      return 9;
    case "T":
      return 8;
  }
  const number = parseInt(c);
  if (number > 0) {
    return number - 2;
  }
  return -1;
}
  */

export function linToBid(b: string) {
  let bid = b.toUpperCase().replace("!", "");
  if (bid.endsWith("N")) {
    bid = bid + "T";
  } else if (bid === "DBL" || bid === "D") {
    bid = "X";
  } else if (bid === "REDBL" || bid === "R") {
    bid = "XX";
  } else if (bid === "P") {
    bid = "Pass";
  } else {
    bid = bid[0] + AllSuits[["C", "D", "H", "S"].indexOf(bid[1])].value;
  }
  return bid;
}

const linToSuitMap: { [x: string]: string } = {
  C: Suit.Club.value,
  D: Suit.Diamond.value,
  H: Suit.Heart.value,
  S: Suit.Spade.value,
};
export function linToSuit(s: string): Suit {
  const suit = linToSuitMap[s];
  if (!suit) throw new Error("Invalid lin suit: " + s);
  return new Suit(suit);
}

const linFromSuitMap = Object.fromEntries(
  Object.entries(linToSuitMap).map(([k, v]) => [v, k])
);
export function linFromSuit(s: Suit) {
  const suit = linFromSuitMap[s.value];
  if (!suit) throw new Error("Invalid suit for lin: " + s);
  return suit;
}

const linToSeatMap: { [x: string]: string } = {
  "1": Seat.South.value,
  "2": Seat.West.value,
  "3": Seat.North.value,
  "4": Seat.East.value,
};
export function linToSeat(s: string): Seat {
  const seat = linToSeatMap[s];
  if (!seat) throw new Error("Invalid lin seat: " + s);
  return new Seat(seat);
}

const linFromSeatMap = Object.fromEntries(
  Object.entries(linToSeatMap).map(([k, v]) => [v, k])
);
export function linFromSeat(s: Seat): string {
  const seat = linFromSeatMap[s.value];
  if (!seat) throw new Error("Invalid set for lin: " + s);
  return seat;
}

const linToVulnerabilityMap: { [x: string]: string } = {
  o: Vulnerability.None.value,
  e: Vulnerability.EastWest.value,
  n: Vulnerability.NorthSouth.value,
  b: Vulnerability.All.value,
};
export function linToVulnerability(v: string): Vulnerability {
  const vul = linToVulnerabilityMap[v];
  if (!vul) throw new Error("Invalid lin vulnerability: " + v);
  return new Vulnerability(vul);
}

const linFromVulnerabilityMap = Object.fromEntries(
  Object.entries(linToVulnerabilityMap).map(([k, v]) => [v, k])
);

export function linFromVulnerability(v: Vulnerability): string {
  const map: { [x: string]: string } = {
    ...linFromVulnerabilityMap,
    0: Vulnerability.None.value, // Additional one-way value.
  };
  const vul = map[v.value];
  if (!vul) throw new Error("Invalid vulnerability for lin: " + v);
  return vul;
}

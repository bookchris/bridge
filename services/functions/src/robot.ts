import {
  benFromCard,
  benFromVulnerability,
  Bid,
  Card,
  Hand,
  Seat,
  Suit,
} from "@bridge/core";
import { Table } from "@bridge/storage";
import axios from "axios";
import { logger } from "firebase-functions/v2";
import { onValueWritten } from "firebase-functions/v2/database";
import { robotTurn } from "./lib/robot";

const baseURL = process.env.BEN_URL;
const fast = true;

//export const robot = onMessagePublished("robot-turn", async (event) => {
export const robot = onValueWritten("/tables/{tableId}", async (event) => {
  const tableId = event.params.tableId;
  /*
  let tableId = "";
  try {
    tableId = event.data.message.json.tableId;
  } catch (e) {
    logger.error("PubSub message was not JSON", e);
    throw e;
  }
  */
  logger.info("robot turn for table " + tableId);
  const data = event.data.after.val();
  const hand = Hand.fromJson(data);
  const table = new Table(hand, {
    id: tableId,
    uids: data.uids,
  });

  /*
  const ref = db
    .collection("tables")
    .withConverter(tableConverter)
    .doc(tableId);
  const snapshot = await ref.get();
  if (!snapshot.exists) {
    throw new Error("Table not found at " + tableId);
  }

  const table = snapshot.data();
  if (!table) throw new Error(`table ${tableId} not found`);
  */

  const turn = robotTurn(table);
  if (!turn) {
    logger.info("Not Robot's turn");
    return;
  }
  logger.info("Robot's turn!");

  let newHand: Hand | undefined;
  if (table.isBidding) {
    const bid = await getBid(table);
    newHand = table.doBid(bid, turn);
    if (!newHand) {
      logger.info("unable to perform bid", bid.toString());
    }
  } else if (table.isPlaying) {
    if (!table.play.length) {
      const card = await getLead(table);
      newHand = table.doPlay(card, turn);
      if (!newHand) {
        logger.info("unable to perform lead", card.toString());
      }
    } else {
      const playable = table
        .getHolding(turn)
        .filter((card) => table.canPlay(card, turn));
      let card: Card;
      if (playable.length === 1) {
        card = playable[0];
      } else {
        card = await getPlay(table);
      }
      newHand = table.doPlay(card, turn);
      if (!newHand) {
        logger.info("unable to perform play", card.toString());
      }
    }
  }
  if (newHand) {
    /*
    const newTable = table.updateHand(newHand);
    await event.data.after.ref.set({
      ...newTable.toJson(),
      uids: newTable.uids,
    });
    */
    //await ref.set(newTable);
    //await triggerRobot(newTable);
  }
});

const getBid = async (hand: Hand) => {
  if (fast) return Promise.resolve(new Bid("Pass"));
  const req = {
    vul: benFromVulnerability(hand.vulnerability),
    hand: getHolding(hand),
    auction: getAuction(hand),
  };
  logger.info("requesting bid", req);
  const resp = await axios.post(baseURL + "/api/bid", req);
  const data: { bid: string } = resp.data;
  logger.info("response", data);
  return new Bid(data.bid);
};

const getLead = async (hand: Hand) => {
  if (fast) {
    return Promise.resolve(hand.getHolding(hand.player || Seat.South)[0]);
  }

  const req = {
    vul: benFromVulnerability(hand.vulnerability),
    hand: getHolding(hand),
    auction: getAuction(hand),
  };
  logger.info("requesting lead", req);
  const resp = await axios.post(baseURL + "/api/lead", req);
  const data: { card: string } = resp.data;
  logger.info("response", data);
  return new Card(data.card);
};

const getPlay = async (hand: Hand) => {
  if (fast) {
    const seat = hand.player || Seat.South;
    const card = hand.getHolding(seat).find((card) => hand.canPlay(card, seat));
    if (!card) throw new Error("no valid play");
    return Promise.resolve(card);
  }
  const req = {
    vul: benFromVulnerability(hand.vulnerability),
    hands: [
      holdingToBen(hand.getDeal(Seat.North)),
      holdingToBen(hand.getDeal(Seat.East)),
      holdingToBen(hand.getDeal(Seat.South)),
      holdingToBen(hand.getDeal(Seat.West)),
    ],
    auction: getAuction(hand),
    play: hand.play.map((c) => benFromCard(c)),
  };
  logger.info("requesting play", req);
  const resp = await axios.post(baseURL + "/api/play", req);
  const data: { card: string } = resp.data;
  logger.info("response", data);
  return new Card(data.card);
};

const getAuction = (hand: Hand) => {
  const padding = [] as string[];
  for (let d = hand.dealer; d !== Seat.North; d = d.next()) {
    padding.push("PAD_START");
  }
  return [...padding, ...hand.bidding.map((b) => b.toBen())];
};

const getHolding = (hand: Hand, seat?: Seat) => {
  if (!seat) {
    seat = hand.turn;
  }
  return holdingToBen(hand.getHolding(seat!));
};

const holdingToBen = (cards: Card[]) => {
  const holdingMap = cards.reduce(
    (m, card) => {
      const suit = card.suit.toString();
      m[suit] += card.rank.toString();
      return m;
    },
    {
      [Suit.Spade.toString()]: "",
      [Suit.Heart.toString()]: "",
      [Suit.Diamond.toString()]: "",
      [Suit.Club.toString()]: "",
    }
  );
  return Object.values(holdingMap).join(".");
};

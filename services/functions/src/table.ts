import {
  CreateTableRequest,
  CreateTableResponse,
  TableBidRequest,
  TableBidResponse,
  TablePlayRequest,
  TablePlayResponse,
} from "@bridge/api";
import { AllSeats, Bid, Card, Hand } from "@bridge/core";
import { Table } from "@bridge/storage";
import { logger } from "firebase-functions/v2";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { database, firestore } from "./lib/firebase";
import { tableConverter } from "./lib/table";

export const createtable = onCall<
  CreateTableRequest,
  Promise<CreateTableResponse>
>(async ({ data, auth }) => {
  const uid = auth?.uid;
  if (!uid) throw new HttpsError("invalid-argument", "user is required");

  const mode = data.mode;
  if (mode !== "solitaire")
    throw new HttpsError("invalid-argument", `invalid mode ${mode}`);

  const ref = firestore
    .collection("tables")
    .withConverter(tableConverter)
    .doc();
  const hand = Hand.fromDeal();
  const table = new Table(hand, {
    id: ref.id,
    uids: [uid, "Robot", "Robot", "Robot"],
  });
  await ref.set(table);

  await database
    .ref("tables/" + ref.id)
    .set({ ...table.toJson(), uids: table.uids });
  return { id: ref.id };
});

export const tablebid = onCall<TableBidRequest, Promise<TableBidResponse>>(
  async ({ data, auth }) => {
    const uid = auth?.uid;
    if (!uid) throw new HttpsError("invalid-argument", "user is required");

    const { tableId } = data;
    if (!tableId)
      throw new HttpsError("invalid-argument", "tableId is required");

    const { bid } = data;
    if (!bid) throw new HttpsError("invalid-argument", "bid is required");

    const ref = database.ref("tables/" + tableId);
    const d = await (await ref.get()).val();
    const hand = Hand.fromJson(d);
    const table = new Table(hand, {
      id: tableId,
      uids: d.uids,
    });

    /*
    const ref = db
      .collection("tables")
      .withConverter(tableConverter)
      .doc(tableId);

    const doc = await ref.get();
    const table = doc.data();
    */
    if (!table)
      throw new HttpsError("invalid-argument", `table ${tableId} not found`);

    const playerIndex = table.uids.indexOf(uid);
    if (playerIndex === -1)
      throw new HttpsError(
        "invalid-argument",
        `${uid} is not a player on table ${tableId}`
      );

    const newHand = table.doBid(new Bid(bid), AllSeats[playerIndex]);
    if (!newHand)
      throw new HttpsError(
        "invalid-argument",
        `${bid} is not a valid bid on ${tableId}`
      );

    //await ref.update({ bidding: newHand.toJson().bidding });
    //const newTable = table.updateHand(newHand);
    await ref.child("bidding").update(newHand.toJson().bidding || []);
    //await ref.set({ ...newTable.toJson(), uids: newTable.uids });
    //await triggerRobot(newTable);
  }
);

export const tableplay = onCall<TablePlayRequest, Promise<TablePlayResponse>>(
  async ({ data, auth }) => {
    logger.info("tableplay start");
    const uid = auth?.uid;
    if (!uid) throw new HttpsError("invalid-argument", "user is required");

    const { tableId } = data;
    if (!tableId)
      throw new HttpsError("invalid-argument", "tableId is required");

    const { card } = data;
    if (typeof card !== "number")
      throw new HttpsError("invalid-argument", "card is required");

    const ref = database.ref("tables/" + tableId);
    const d = await (await ref.get()).val();
    const hand = Hand.fromJson(d);
    const table = new Table(hand, {
      id: tableId,
      uids: d.uids,
    });

    /*
    const ref = db
      .collection("tables")
      .withConverter(tableConverter)
      .doc(tableId);

    const doc = await ref.get();
    const table = doc.data();*
    */
    if (!table)
      throw new HttpsError("invalid-argument", `table ${tableId} not found`);

    const playerIndex = table.uids.indexOf(uid);
    if (playerIndex === -1)
      throw new HttpsError(
        "invalid-argument",
        `${uid} is not a player on table ${tableId}`
      );

    const newHand = table.doPlay(new Card(card), AllSeats[playerIndex]);
    if (!newHand)
      throw new HttpsError(
        "invalid-argument",
        `${card} is not a valid play on ${tableId}`
      );

    //const newTable = table.updateHand(newHand);
    //await ref.set({ ...newTable.toJson(), uids: newTable.uids });
    await ref.child("play").update(newHand.toJson().play || []);
    //await ref.update({ play: newHand.toJson().play });
    logger.info("tableplay end");
    //await triggerRobot(table.updateHand(newHand));
  }
);

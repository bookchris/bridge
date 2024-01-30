import { Hand } from "@bridge/core";
import { Table } from "@bridge/storage";
import { firestore } from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export const tableConverter: FirebaseFirestore.FirestoreDataConverter<Table> = {
  toFirestore(table: Table): FirebaseFirestore.DocumentData {
    return {
      ...table.toJson(),
      uids: table.uids,
      created: table.created
        ? Timestamp.fromDate(table.created)
        : firestore.FieldValue.serverTimestamp(),
    };
  },
  fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot): Table {
    const data = snapshot.data();
    const hand = Hand.fromJson(data);
    const created: Timestamp = data.created;
    return new Table(hand, {
      id: snapshot.id,
      uids: data.uids,
      created: created.toDate(),
    });
  },
};

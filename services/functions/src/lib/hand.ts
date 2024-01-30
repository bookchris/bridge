import { Hand } from "@bridge/core";
import { StoredHand } from "@bridge/storage";
import { firestore } from "firebase-admin";
import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  Timestamp,
  WithFieldValue,
} from "firebase-admin/firestore";

interface StoredHandDb {
  uids: string[];
  created: Timestamp;
}

export class HandConverter implements FirestoreDataConverter<StoredHand> {
  toFirestore(hand: StoredHand): WithFieldValue<StoredHandDb> {
    return {
      ...hand.toJson(),
      uids: hand.uids,
      created: hand.created
        ? Timestamp.fromDate(hand.created)
        : firestore.FieldValue.serverTimestamp(),
    };
  }

  fromFirestore(snapshot: QueryDocumentSnapshot): StoredHand {
    const data = snapshot.data();
    const hand = Hand.fromJson(data);
    const created: Timestamp = data.created;
    return new StoredHand(hand, {
      id: snapshot.id,
      uids: data.uids,
      created: created.toDate(),
    });
  }
}

import { Hand } from "@bridge/core";
import { StoredHand } from "@bridge/storage";
import {
  collection,
  doc,
  DocumentData,
  FirestoreDataConverter,
  orderBy,
  query,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
  where,
} from "firebase/firestore";
import {
  useCollectionData,
  useDocumentData,
} from "react-firebase-hooks/firestore";
import { firestore } from "./firebase";

const handConverter: FirestoreDataConverter<StoredHand> = {
  toFirestore(hand: StoredHand): DocumentData {
    return hand.toJson();
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ): StoredHand {
    const data = snapshot.data(options);
    const hand = Hand.fromJson(data);
    const created: Timestamp = data.created;
    return new StoredHand(hand, {
      id: snapshot.id,
      uids: data.uids,
      created: created.toDate(),
    });
  },
};

export function useHand(handId: string) {
  const ref = handId
    ? doc(firestore, "hands", handId).withConverter(handConverter)
    : null;
  return useDocumentData<StoredHand>(ref);
}

export function useHandList(uid: string) {
  const ref = uid
    ? query(
        collection(firestore, "hands").withConverter(handConverter),
        where("uids", "array-contains", uid),
        orderBy("created", "desc"),
      )
    : null;
  return useCollectionData<StoredHand>(ref);
}

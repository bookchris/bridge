import { ImportHandRequest, ImportHandResponse } from "@bridge/api";
import { Hand } from "@bridge/core";
import { StoredHand } from "@bridge/storage";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { firestore } from "./lib/firebase";
import { HandConverter } from "./lib/hand";

export const importhand = onCall<
  ImportHandRequest,
  Promise<ImportHandResponse>
>(async ({ data, auth }) => {
  const uid = auth?.uid;
  if (!uid) throw new HttpsError("invalid-argument", "user is required");

  const { input } = data;
  if (!input) throw new HttpsError("invalid-argument", "input is required");

  let hand: Hand;
  try {
    hand = Hand.fromLin(input);
  } catch (err: unknown) {
    console.error("import exception: ", err);
    throw new HttpsError("invalid-argument", errorToString(err));
  }
  const ref = firestore
    .collection("hands")
    .withConverter(new HandConverter())
    .doc();
  await ref.set(new StoredHand(hand, { id: ref.id, uids: [uid] }));
  return { id: ref.id };
});

function errorToString(err: unknown) {
  return err instanceof Error ? err.message : "unknown error";
}

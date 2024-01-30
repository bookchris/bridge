import * as admin from "firebase-admin";
import { firebaseConfig } from "./firebaseConfig";

const firebaseApp = admin.apps[0] || admin.initializeApp(firebaseConfig);
export const auth = firebaseApp.auth();
export const database = firebaseApp.database();
export const firestore = firebaseApp.firestore();

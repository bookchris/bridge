import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

if (!getApps().length) {
  initializeApp({
    apiKey: "AIzaSyCtSsAIy3AFecDUcyvX7l6gbp-FKhQgeQs",
    authDomain: "freebridge.firebaseapp.com",
    databaseURL: "https://freebridge-default-rtdb.firebaseio.com",
    projectId: "freebridge",
    storageBucket: "freebridge.appspot.com",
    messagingSenderId: "856419566005",
    appId: "1:856419566005:web:64f1efe8de70461f9119fc",
    measurementId: "G-CZJFR4Q370",
  });
}

export const auth = getAuth(getApp());
export const googleAuthProvider = new GoogleAuthProvider();

export const firestore = getFirestore(getApp());
export const functions = getFunctions(getApp());
export const database = getDatabase(getApp());

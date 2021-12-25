import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC3nq7s4cu90GHzkC2Xil3huzX3vBg5ESk",
  authDomain: "twtterclone.firebaseapp.com",
  projectId: "twtterclone",
  storageBucket: "twtterclone.appspot.com",
  messagingSenderId: "693002338813",
  appId: "1:693002338813:web:f5ab2bec4c9cd4f1a11994",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore();
const storage = getStorage();

export default app;
export { db, storage };

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAc4mN0M_jtbw3DugcwjUFHEtAn_eVFwAA",
  authDomain: "aibusinesscardanalyzer.firebaseapp.com",
  projectId: "aibusinesscardanalyzer",
  storageBucket: "aibusinesscardanalyzer.appspot.com",
  messagingSenderId: "488956092428",
  appId: "1:488956092428:web:546d0531ae5f433791ce29",
  measurementId: "G-251LC96RKC",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

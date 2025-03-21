import { initializeApp } from "firebase/app";
// import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDOh_dcanjf2ktZeXZakJn052mGc5Lz828",
  authDomain: "moko-ebfe8.firebaseapp.com",
  projectId: "moko-ebfe8",
  storageBucket: "moko-ebfe8.firebasestorage.app",
  messagingSenderId: "824466679178",
  appId: "1:824466679178:web:105bb08ba27c7843e55473",
  measurementId: "G-WKV0YXM3VL"
};
// ✅ Initialize Firebase FIRST
const app = initializeApp(firebaseConfig);

// ✅ Initialize Auth AFTER Firebase is initialized
const auth = getAuth(app);

export { auth };
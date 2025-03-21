import { initializeApp } from "firebase/app";
// import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
apiKey: "AIzaSyC0_kCbTrXVmdiocpPO80dfR6rwIwQpAII",
  authDomain: "educamp-cd15a.firebaseapp.com",
  projectId: "educamp-cd15a",
  storageBucket: "educamp-cd15a.firebasestorage.app",
  messagingSenderId: "25168391197",
  appId: "1:25168391197:web:5f78e318d57082c5f7eaf4",
  measurementId: "G-HBT21HVY2V"
};
// ✅ Initialize Firebase FIRST
const app = initializeApp(firebaseConfig);

// ✅ Initialize Auth AFTER Firebase is initialized
const auth = getAuth(app);

export { auth };

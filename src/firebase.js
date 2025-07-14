import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "",
    authDomain: "pong-game-c58c9.firebaseapp.com",
    projectId: "pong-game-c58c9",
    storageBucket: "pong-game-c58c9.firebasestorage.app",
    messagingSenderId: "156883431965",
    appId: "1:156883431965:web:0747fbd26ad95ab8be8cf4",
    measurementId: "G-TE580YY3XV"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { auth, googleProvider, facebookProvider };
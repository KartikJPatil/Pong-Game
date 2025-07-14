import React from "react";
import { auth, googleProvider, facebookProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";

export default function AuthScreen({ onAuth }) {
  const handleLogin = async (provider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      onAuth(result.user);
    } catch (e) {
      alert("Authentication error: " + e.message);
    }
  };
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#222" }}>
      <h2 style={{ color: "#fff", marginBottom: "1em" }}>Welcome to Pong</h2>
      <button style={{ margin: 12, fontSize: 18, padding: "0.7em 2em", background: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
        onClick={() => handleLogin(googleProvider)}>
        Sign in with Google
      </button>
      <button style={{ margin: 12, fontSize: 18, padding: "0.7em 2em", background: "#4267B2", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
        onClick={() => handleLogin(facebookProvider)}>
        Sign in with Facebook
      </button>
    </div>
  );
}
import React, { useState } from "react";
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "../firebase";

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleFacebookAuth = async () => {
    try {
      await signInWithPopup(auth, facebookProvider);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 50%, #0f0f0f 100%)"
    }}>
      <div style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "20px",
        padding: "40px",
        minWidth: "400px",
        textAlign: "center"
      }}>
        <h1 style={{ 
          color: "#0ff", 
          marginBottom: "30px",
          background: "linear-gradient(45deg, #0ff, #f0f)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          🏓 PONG GAME
        </h1>
        
        <p style={{ color: "#fff", marginBottom: "30px" }}>
          Sign in to save your scores and play online!
        </p>

        {/* Social Login Buttons */}
        <div style={{ marginBottom: "30px" }}>
          <button
            onClick={handleGoogleAuth}
            style={{
              width: "100%",
              padding: "12px",
              margin: "10px 0",
              background: "linear-gradient(45deg, #4285f4, #34a853)",
              border: "none",
              borderRadius: "25px",
              color: "#fff",
              fontSize: "16px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            🔍 Continue with Google
          </button>
          
          <button
            onClick={handleFacebookAuth}
            style={{
              width: "100%",
              padding: "12px",
              margin: "10px 0",
              background: "linear-gradient(45deg, #1877f2, #42a5f5)",
              border: "none",
              borderRadius: "25px",
              color: "#fff",
              fontSize: "16px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            📘 Continue with Facebook
          </button>
        </div>

        <div style={{ color: "#888", margin: "20px 0" }}>or</div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailAuth}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              margin: "10px 0",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "25px",
              color: "#fff",
              fontSize: "16px",
              outline: "none"
            }}
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              margin: "10px 0",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "25px",
              color: "#fff",
              fontSize: "16px",
              outline: "none"
            }}
          />
          
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              margin: "20px 0",
              background: "linear-gradient(45deg, #0ff, #0aa)",
              border: "none",
              borderRadius: "25px",
              color: "#000",
              fontSize: "16px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            {isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        {/* Toggle Sign Up / Sign In */}
        <p style={{ color: "#888" }}>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            style={{
              background: "none",
              border: "none",
              color: "#0ff",
              cursor: "pointer",
              textDecoration: "underline"
            }}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>

        {/* Error Display */}
        {error && (
          <p style={{ 
            color: "#ff4444", 
            marginTop: "20px",
            background: "rgba(255,68,68,0.1)",
            padding: "10px",
            borderRadius: "10px",
            fontSize: "14px"
          }}>
            {error}
          </p>
        )}

        {/* Guest Play Option */}
        <div style={{ marginTop: "30px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <p style={{ color: "#888", fontSize: "14px" }}>
            Want to play without signing in? You'll lose your progress.
          </p>
          <button
            onClick={() => {/* We can add guest mode later */}}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "15px",
              color: "#fff",
              padding: "8px 16px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            Play as Guest
          </button>
        </div>
      </div>
    </div>
  );
}

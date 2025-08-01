import React, { useEffect, useState } from "react";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";
import PongGame from "./PongGame";
import AuthScreen from "./components/AuthScreen";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 50%, #0f0f0f 100%)"
      }}>
        <div style={{ color: "#0ff", fontSize: "1.2em" }}>Loading...</div>
      </div>
    );
  }

  if (!user) return <AuthScreen />;
  
  return (
    <div className="App">
      {/* User Info Bar with Logout */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(10px)",
        padding: "10px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid rgba(255,255,255,0.1)"
      }}>
        <div style={{ color: "#0ff", fontSize: "14px" }}>
          Welcome, {user.displayName || user.email}! 🏓
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: "linear-gradient(45deg, #f44, #a22)",
            border: "none",
            borderRadius: "20px",
            color: "#fff",
            padding: "8px 16px",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.05)";
            e.target.style.boxShadow = "0 4px 15px rgba(255,68,68,0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "none";
          }}
        >
          🚪 Logout
        </button>
      </div>

      {/* Main Game - with top padding to account for user bar */}
      <div style={{ paddingTop: "60px" }}>
        <PongGame user={user} />
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { auth } from "./firebase";
import PongGame from "./components/PongGame";
import AuthScreen from "./components/AuthScreen";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(setUser);
    return () => unsub();
  }, []);

  if (!user) return <AuthScreen onAuth={setUser} />;
  return (
    <div>
      <div style={{ textAlign: "right", padding: 10, color: "#fff" }}>
        Welcome, {user.displayName} <img src={user.photoURL} alt="avatar" style={{ width: 32, borderRadius: "50%", verticalAlign: "middle", marginLeft: 8 }} />
        <button style={{ marginLeft: 16, padding: "6px 14px", borderRadius: 8, border: "none", background: "#f44", color: "#fff", fontWeight: 600, cursor: "pointer" }}
          onClick={() => auth.signOut()}>
          Sign Out
        </button>
      </div>
      <PongGame user={user} />
    </div>
  );
}
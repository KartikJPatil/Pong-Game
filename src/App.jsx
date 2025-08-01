import React, { useEffect, useState } from "react";
import { auth } from "./firebase";
import PongGame from "./PongGame";  // Fixed path - PongGame is in src root
import AuthScreen from "./components/AuthScreen";  // This component needs to be created

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(setUser);
    return () => unsub();
  }, []);

  if (!user) return <AuthScreen />;
  
  return (
    <div className="App">
      <PongGame />
    </div>
  );
}

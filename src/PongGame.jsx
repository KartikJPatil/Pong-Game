import React, { useRef, useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import Modal from "react-modal";

// Components
import GameHeader, { themes } from "./components/GameHeader";
import MultiplayerSection from "./components/MultiplayerSection";
import GameStats from "./components/GameStats";
import GameBoard from "./components/GameBoard";
import TouchControls from "./components/TouchControls";
import GameControls from "./components/GameControls";
import ChatSection from "./components/ChatSection";
import Scoreboard from "./components/Scoreboard";
import Controls from "./components/Controls";
import KeyConfig from "./components/KeyConfig";
import Leaderboard from "./components/Leaderboard";

// Utils
import { clamp, getBallSpeed, playBeep, GAME_CONSTANTS, SOCKET_URL } from "./utils/gameUtils";

import "./PongGame.css";

const { WIDTH, HEIGHT, PADDLE_HEIGHT, PADDLE_WIDTH, BALL_SIZE, BASE_PADDLE_SPEED, BASE_BALL_SPEED, TRAIL_LEN } = GAME_CONSTANTS;

export default function PongGame() {
  // State variables
  const [leftPaddle, setLeftPaddle] = useState(HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [rightPaddle, setRightPaddle] = useState(HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [difficulty, setDifficulty] = useState(5);

  const [ball, setBall] = useState(() => {
    const initialSpeed = getBallSpeed(5);
    return {
      x: WIDTH / 2 - BALL_SIZE / 2,
      y: HEIGHT / 2 - BALL_SIZE / 2,
      dx: initialSpeed,
      dy: initialSpeed,
      speed: initialSpeed
    };
  });

  const [score, setScore] = useState({ left: 0, right: 0 });
  const [winner, setWinner] = useState("");
  const [running, setRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [theme, setTheme] = useState("classic");
  const [isMuted, setIsMuted] = useState(false);
  const [twoPlayer, setTwoPlayer] = useState(false);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [keyMap, setKeyMap] = useState({
    leftUp: "w", leftDown: "s", rightUp: "ArrowUp", rightDown: "ArrowDown"
  });

  // Touch
  const [touchDirL, setTouchDirL] = useState(0);
  const [touchDirR, setTouchDirR] = useState(0);

  // Ball trail
  const [trail, setTrail] = useState([]);

  // Power-ups
  const [powerUp, setPowerUp] = useState(null);
  const [powerUpTimer, setPowerUpTimer] = useState(0);

  // Leaderboard
  const [scores, setScores] = useState(() => JSON.parse(localStorage.getItem("pong-leaderboard") || "[]"));

  // Win Score
  const [winScore, setWinScore] = useState(5);

  // Multiplayer
  const [socket, setSocket] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [room, setRoom] = useState("");
  const [multiplayer, setMultiplayer] = useState(false);
  const [players, setPlayers] = useState(1);
  const [side, setSide] = useState("");

  // Chat
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  // Leaderboard modal
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Refs
  const keys = useRef({});
  const animationRef = useRef();
  const boardAreaRef = useRef();
  const [boardRect, setBoardRect] = useState(null);

  // Responsive sizing
  const [svgW, setSvgW] = useState(WIDTH), [svgH, setSvgH] = useState(HEIGHT);

  // Update board rect for touch controls
  useEffect(() => {
    function updateRect() {
      if (boardAreaRef.current) setBoardRect(boardAreaRef.current.getBoundingClientRect());
    }
    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, []);

  // Key handling
  useEffect(() => {
    const down = (e) => {
      e.preventDefault();
      keys.current[e.key] = true;
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        keys.current[e.key] = true;
      }
    };
    const up = (e) => {
      e.preventDefault();
      keys.current[e.key] = false;
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        keys.current[e.key] = false;
      }
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // Responsive sizing
  useEffect(() => {
    function handleResize() {
      let w = Math.min(window.innerWidth - 20, WIDTH);
      let h = Math.round(w * HEIGHT / WIDTH);
      setSvgW(w); setSvgH(h);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Document title update
  useEffect(() => {
    if (winner) {
      document.title = `Pong Winner: ${winner}`;
    } else {
      document.title = `Pong ${score.left}:${score.right}`;
    }
  }, [score, winner]);

  // Multiplayer functions
  function startMultiplayer(roomCode) {
    if (socket) socket.disconnect();
    const s = io(SOCKET_URL);
    setSocket(s);
    setRoom(roomCode);
    setMultiplayer(true);
    setTwoPlayer(false);
    s.emit("join", { room: roomCode });

    s.on("players", count => setPlayers(count));
    s.on("host", () => { setIsHost(true); setSide("host"); });
    s.on("side", _side => setSide(_side));
    s.on("full", () => { alert("Room is full"); s.disconnect(); setMultiplayer(false); setIsHost(false); setSide(""); });

    s.on("state_update", (state) => {
      if (side === "guest") {
        setLeftPaddle(state.leftPaddle);
        setRightPaddle(state.rightPaddle);
        setBall(state.ball);
        setScore(state.score);
        setPowerUp(state.powerUp);
        setTrail(state.trail);
        setWinner(state.winner);
        setRunning(state.running);
      }
    });

    s.on("guest_paddle_input", (input) => {
      if (isHost) setRightPaddle(input);
    });

    s.on("chat", ({ msg, sender }) => {
      setChatMessages(msgs => [...msgs, { msg, sender }]);
    });

    s.on("disconnect", () => {
      setMultiplayer(false);
      setSocket(null);
      setIsHost(false);
      setPlayers(1);
      setRoom("");
      setSide("");
      alert("Disconnected from multiplayer server.");
    });
  }

  // Paddle movement
  const updatePaddles = useCallback(() => {
    let lPad = leftPaddle;
    let rPad = rightPaddle;

    const lUp = keys.current[keyMap.leftUp] || keys.current[keyMap.leftUp.toLowerCase()] || keys.current[keyMap.leftUp.toUpperCase()];
    const lDn = keys.current[keyMap.leftDown] || keys.current[keyMap.leftDown.toLowerCase()] || keys.current[keyMap.leftDown.toUpperCase()];
    const rUp = keys.current[keyMap.rightUp] || keys.current[keyMap.rightUp.toLowerCase()] || keys.current[keyMap.rightUp.toUpperCase()];
    const rDn = keys.current[keyMap.rightDown] || keys.current[keyMap.rightDown.toLowerCase()] || keys.current[keyMap.rightDown.toUpperCase()];

    const lUpTouch = touchDirL === -1;
    const lDnTouch = touchDirL === 1;
    const rUpTouch = touchDirR === -1;
    const rDnTouch = touchDirR === 1;

    const paddleSpeed = BASE_PADDLE_SPEED + (difficulty - 5);

    if (lUp || lUpTouch) {
      lPad -= paddleSpeed;
    }
    if (lDn || lDnTouch) {
      lPad += paddleSpeed;
    }

    if (multiplayer) {
      // Multiplayer logic
    } else if (twoPlayer) {
      if (rUp || rUpTouch) {
        rPad -= paddleSpeed;
      }
      if (rDn || rDnTouch) {
        rPad += paddleSpeed;
      }
    } else {
      // AI
      const aiCenter = rPad + PADDLE_HEIGHT / 2;
      const aiTarget = ball.y + BALL_SIZE / 2 + (Math.random() * 8 - 4);
      const aiSpeed = BASE_PADDLE_SPEED + (difficulty * 1.5);
      if (aiCenter < aiTarget - 8) {
        rPad += aiSpeed;
      } else if (aiCenter > aiTarget + 8) {
        rPad -= aiSpeed;
      }
    }

    lPad = clamp(lPad, 0, HEIGHT - PADDLE_HEIGHT);
    rPad = clamp(rPad, 0, HEIGHT - PADDLE_HEIGHT);

    return { lPad, rPad };
  }, [leftPaddle, rightPaddle, ball.y, difficulty, keyMap, touchDirL, touchDirR, multiplayer, isHost, twoPlayer]);

  // Game loop
  useEffect(() => {
    if (!running || isPaused || winner) return;
    if (multiplayer && !isHost) return;

    function gameLoop() {
      const { lPad, rPad } = updatePaddles();

      let { x, y, dx, dy, speed } = ball;

      x += dx;
      y += dy;
      let curSpeed = Math.sqrt(dx * dx + dy * dy);

      setTrail(trail => {
        let next = [{ x, y }, ...trail];
        if (next.length > TRAIL_LEN) next.pop();
        return next;
      });

      if (y <= 0 || y + BALL_SIZE >= HEIGHT) {
        dy = -dy;
        playBeep(800, 60, 0.08, isMuted);
      }

      if (
        x <= PADDLE_WIDTH &&
        y + BALL_SIZE > lPad &&
        y < lPad + PADDLE_HEIGHT
      ) {
        x = PADDLE_WIDTH;
        let impact = (y + BALL_SIZE / 2 - (lPad + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
        let angle = impact * Math.PI / 4;
        let speedup = 1.05 + (difficulty - 5) * 0.005;
        curSpeed *= speedup;
        dx = Math.abs(curSpeed * Math.cos(angle));
        dy = curSpeed * Math.sin(angle);
        playBeep(400, 80, 0.08, isMuted);
      }

      if (
        x + BALL_SIZE >= WIDTH - PADDLE_WIDTH &&
        y + BALL_SIZE > rPad &&
        y < rPad + PADDLE_HEIGHT
      ) {
        x = WIDTH - PADDLE_WIDTH - BALL_SIZE;
        let impact = (y + BALL_SIZE / 2 - (rPad + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
        let angle = impact * Math.PI / 4;
        let speedup = 1.05 + (difficulty - 5) * 0.005;
        curSpeed *= speedup;
        dx = -Math.abs(curSpeed * Math.cos(angle));
        dy = curSpeed * Math.sin(angle);
        playBeep(200, 80, 0.08, isMuted);
      }

      if (powerUp && x + BALL_SIZE > powerUp.x && x < powerUp.x + powerUp.size &&
        y + BALL_SIZE > powerUp.y && y < powerUp.y + powerUp.size) {
        if (powerUp.type === "enlarge") {
          setLeftPaddle(lPad => clamp(lPad, 0, HEIGHT - (PADDLE_HEIGHT * 1.7)));
          setRightPaddle(rPad => clamp(rPad, 0, HEIGHT - (PADDLE_HEIGHT * 1.7)));
        }
        if (powerUp.type === "shrink") {
          setLeftPaddle(lPad => clamp(lPad, 0, HEIGHT - (PADDLE_HEIGHT * 0.7)));
          setRightPaddle(rPad => clamp(rPad, 0, HEIGHT - (PADDLE_HEIGHT * 0.7)));
        }
        if (powerUp.type === "multi") {
          dx *= 1.5; dy *= 1.5;
        }
        setPowerUp(null);
        playBeep(1000, 120, 0.12, isMuted);
      }

      let newScore = { ...score };
      let scored = false, win = "";
      if (x < 0) {
        newScore.right += 1; scored = true;
        playBeep(120, 300, 0.18, isMuted);
        if (newScore.right >= winScore) win = "Right";
      } else if (x > WIDTH - BALL_SIZE) {
        newScore.left += 1; scored = true;
        playBeep(800, 300, 0.18, isMuted);
        if (newScore.left >= winScore) win = "Left";
      }

      if (scored) {
        const resetSpeed = getBallSpeed(difficulty);
        setLeftPaddle(HEIGHT / 2 - PADDLE_HEIGHT / 2);
        setRightPaddle(HEIGHT / 2 - PADDLE_HEIGHT / 2);
        setBall({
          x: WIDTH / 2 - BALL_SIZE / 2,
          y: HEIGHT / 2 - BALL_SIZE / 2,
          dx: (Math.random() > 0.5 ? 1 : -1) * resetSpeed,
          dy: (Math.random() > 0.5 ? 1 : -1) * resetSpeed,
          speed: resetSpeed
        });
        setScore(newScore);
        setTrail([]);
        setPowerUp(null);
        setPowerUpTimer(0);
        if (win) {
          setWinner(win);
          let now = new Date();
          let entry = {
            left: newScore.left, right: newScore.right, winner: win,
            date: now.toLocaleDateString() + " " + now.toLocaleTimeString()
          };
          let nextScores = [entry, ...scores].slice(0, 5);
          setScores(nextScores);
          localStorage.setItem("pong-leaderboard", JSON.stringify(nextScores));
          setRunning(false);
        }
        animationRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      setLeftPaddle(lPad);
      setRightPaddle(rPad);
      setBall({ x, y, dx, dy, speed: curSpeed });

      if (!powerUp && (powerUpTimer > 200 + Math.random() * 400)) {
        let px = Math.random() * (WIDTH - 80) + 40, py = Math.random() * (HEIGHT - 60) + 30;
        let types = ["enlarge", "shrink", "multi"];
        setPowerUp({
          x: px, y: py, size: 26, type: types[Math.floor(Math.random() * types.length)]
        });
        setPowerUpTimer(0);
      } else if (!powerUp) {
        setPowerUpTimer(t => t + 1);
      }

      if (multiplayer && isHost && socket) {
        socket.emit("sync_state", {
          room, state: {
            leftPaddle: lPad, rightPaddle: rPad, ball: { x, y, dx, dy, speed: curSpeed }, score: newScore,
            powerUp, trail, winner, running: true
          }
        });
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    }

    animationRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationRef.current);
  }, [running, isPaused, winner, multiplayer, isHost, updatePaddles, ball, score, powerUp, powerUpTimer, winScore, isMuted, scores, socket, room, trail, difficulty]);

  // Multiplayer paddle sync
  useEffect(() => {
    if (multiplayer && socket && !isHost && side === "guest") {
      socket.emit("paddle_input", { room, input: leftPaddle });
    }
  }, [leftPaddle, multiplayer, socket, isHost, room, side]);

  // Chat handling
  function handleSendChat(e) {
    e.preventDefault();
    if (socket && chatInput.trim()) {
      socket.emit("chat", { room, msg: chatInput.trim(), sender: side || "anon" });
      setChatInput("");
    }
  }

  // Start/Restart game
  function handleStart() {
    const initialSpeed = getBallSpeed(difficulty);
    setScore({ left: 0, right: 0 });
    setBall({
      x: WIDTH / 2 - BALL_SIZE / 2,
      y: HEIGHT / 2 - BALL_SIZE / 2,
      dx: (Math.random() > 0.5 ? 1 : -1) * initialSpeed,
      dy: (Math.random() > 0.5 ? 1 : -1) * initialSpeed,
      speed: initialSpeed
    });
    setLeftPaddle(HEIGHT / 2 - PADDLE_HEIGHT / 2);
    setRightPaddle(HEIGHT / 2 - PADDLE_HEIGHT / 2);
    setWinner("");
    setTrail([]);
    setPowerUp(null);
    setPowerUpTimer(0);
    setRunning(true);
  }

  return (
    <div className="pong-container" style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 50%, #0f0f0f 100%)",
      padding: "20px 10px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      {/* Winner Modal */}
      <Modal
        isOpen={!!winner}
        onRequestClose={() => setWinner("")}
        className="pong-modal"
        overlayClassName="pong-modal-overlay"
        ariaHideApp={false}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(10px)"
          },
          content: {
            background: "linear-gradient(145deg, #1a1a2e, #16213e)",
            border: "2px solid #0ff",
            borderRadius: "20px",
            color: "#fff",
            textAlign: "center",
            maxWidth: "400px",
            margin: "auto",
            boxShadow: "0 0 30px rgba(0,255,255,0.5)"
          }
        }}
      >
        <h2 style={{ fontSize: 32, margin: "0.5em 0", color: "#0ff", textShadow: "0 0 20px rgba(0,255,255,0.5)" }}>
          🎉 {winner} Wins! 🎉
        </h2>
        <p style={{ fontSize: 22, margin: "0.8em 0" }}>Final Score: {score.left} - {score.right}</p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", margin: "20px 0" }}>
          <button className="pong-btn" onClick={handleStart}>🔄 Rematch</button>
          <button className="pong-btn" onClick={() => setWinner("")}>❌ Close</button>
        </div>
        <button className="pong-btn" style={{ marginTop: 15 }} onClick={() => setShowLeaderboard(true)}>
          🏆 Leaderboard
        </button>
      </Modal>

      {/* Leaderboard Modal */}
      <Modal
        isOpen={showLeaderboard}
        onRequestClose={() => setShowLeaderboard(false)}
        className="pong-modal"
        overlayClassName="pong-modal-overlay"
        ariaHideApp={false}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(10px)"
          },
          content: {
            background: "linear-gradient(145deg, #1a1a2e, #16213e)",
            border: "2px solid #0ff",
            borderRadius: "20px",
            color: "#fff",
            maxWidth: "500px",
            margin: "auto",
            boxShadow: "0 0 30px rgba(0,255,255,0.5)"
          }
        }}
      >
        <h2 style={{ textAlign: "center", color: "#0ff" }}>🏆 Leaderboard</h2>
        <Leaderboard scores={scores} />
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button className="pong-btn" onClick={() => setShowLeaderboard(false)}>Close</button>
        </div>
      </Modal>

      {/* Main Game Components */}
      <GameHeader theme={theme} setTheme={setTheme} />

      <MultiplayerSection
        multiplayer={multiplayer}
        players={players}
        room={room}
        isHost={isHost}
        side={side}
        startMultiplayer={startMultiplayer}
        socket={socket}
        setMultiplayer={setMultiplayer}
      />

      <Scoreboard
        left={score.left}
        right={score.right}
        winningScore={winScore}
        winner={winner}
        onRestart={handleStart}
      />

      <GameStats
        difficulty={difficulty}
        winScore={winScore}
        multiplayer={multiplayer}
        twoPlayer={twoPlayer}
        theme={themes[theme]}
      />

      <Controls
        difficulty={difficulty} setDifficulty={setDifficulty}
        theme={theme} setTheme={setTheme}
        isPaused={isPaused} onPauseToggle={() => setIsPaused(p => !p)}
        isMuted={isMuted} onMuteToggle={() => setIsMuted(m => !m)}
        twoPlayer={twoPlayer && !multiplayer} setTwoPlayer={setTwoPlayer}
        showKeyConfig={showKeyConfig} setShowKeyConfig={setShowKeyConfig}
        winScore={winScore} setWinScore={setWinScore}
        disabled={multiplayer && !isHost}
      />

      {showKeyConfig && (
        <div className="pong-keyconfig" style={{
          margin: "15px 0",
          padding: "20px",
          borderRadius: "15px",
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(5px)",
          border: "1px solid rgba(255,255,255,0.1)"
        }}>
          <KeyConfig keyMap={keyMap} setKeyMap={setKeyMap} />
        </div>
      )}

      {/* Game Board with Two Player Touch Controls (Fixed beside court) */}
      {/* Game Board with Two Player Touch Controls - FIXED CONTAINER */}
      {/* Game Board with Two Player Touch Controls - FIXED */}
      {/* Game Board with Two Player Touch Controls - CLOSER TO COURT */}
      <div style={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        margin: "20px 0"
      }}>
        <GameBoard
          svgW={svgW}
          svgH={svgH}
          WIDTH={WIDTH}
          HEIGHT={HEIGHT}
          PADDLE_WIDTH={PADDLE_WIDTH}
          PADDLE_HEIGHT={PADDLE_HEIGHT}
          BALL_SIZE={BALL_SIZE}
          theme={themes[theme]}
          leftPaddle={leftPaddle}
          rightPaddle={rightPaddle}
          ball={ball}
          trail={trail}
          powerUp={powerUp}
          boardAreaRef={boardAreaRef}
        />

        {/* Two Player Mode: Touch controls CLOSER to court */}
        {(twoPlayer && !multiplayer) && (
          <>
            {/* Left Player Controls - Much closer */}
            <div style={{
              position: "absolute",
              left: "1400px", // Changed from -90px to -85px (closer)
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 100
            }}>
              <TouchControls
                player="left"
                boardRect={boardRect}
                twoPlayer={twoPlayer}
                multiplayer={multiplayer}
                touchDirL={touchDirL}
                touchDirR={touchDirR}
                setTouchDirL={setTouchDirL}
                setTouchDirR={setTouchDirR}
                running={running}
                winner={winner}
              />
            </div>

            {/* Right Player Controls - Much closer */}
            <div style={{
              position: "absolute",
              right: "1400px", // Changed from -90px to -85px (closer)
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 100
            }}>
              <TouchControls
                player="right"
                boardRect={boardRect}
                twoPlayer={twoPlayer}
                multiplayer={multiplayer}
                touchDirL={touchDirL}
                touchDirR={touchDirR}
                setTouchDirL={setTouchDirL}
                setTouchDirR={setTouchDirR}
                running={running}
                winner={winner}
              />
            </div>
          </>
        )}
      </div>




      <GameControls
        running={running}
        winner={winner}
        isPaused={isPaused}
        theme={themes[theme]}
        keyMap={keyMap}
        twoPlayer={twoPlayer}
        multiplayer={multiplayer}
        handleStart={handleStart}
        setRunning={setRunning}
      />

      {/* Single Player Mode: Touch controls between start button and leaderboard */}
      {(!twoPlayer && !multiplayer) && (
        <TouchControls
          player="left"
          boardRect={boardRect}
          twoPlayer={twoPlayer}
          multiplayer={multiplayer}
          touchDirL={touchDirL}
          touchDirR={touchDirR}
          setTouchDirL={setTouchDirL}
          setTouchDirR={setTouchDirR}
          running={running}
          winner={winner}
        />
      )}

      {/* Leaderboard */}
      <div style={{
        margin: "20px 0",
        padding: "20px",
        borderRadius: "15px",
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(5px)",
        border: "1px solid rgba(255,255,255,0.1)",
        maxWidth: "600px",
        width: "100%"
      }}>
        <Leaderboard scores={scores} />
        <div style={{ textAlign: "center", marginTop: "15px" }}>
          <button
            className="pong-btn"
            onClick={() => setShowLeaderboard(true)}
            style={{
              background: "linear-gradient(45deg, #0ff, #0aa)",
              border: "none",
              borderRadius: 20
            }}
          >
            🏆 View Full Leaderboard
          </button>
        </div>
      </div>

      <ChatSection
        multiplayer={multiplayer}
        chatMessages={chatMessages}
        chatInput={chatInput}
        setChatInput={setChatInput}
        handleSendChat={handleSendChat}
      />

      {/* Footer */}
      <div style={{ color: "#666", margin: "30px 0 10px 0", fontSize: "12px", textAlign: "center" }}>
        <div style={{ marginBottom: "5px" }}>
          <span aria-label="Accessibility: game is keyboard and screen reader friendly">♿</span>
          &nbsp; Accessible Design
        </div>
        <div>Pong in React+Vite &copy; 2025</div>
      </div>
    </div>
  );
}

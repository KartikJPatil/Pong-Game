import React, { useRef, useEffect, useState, useCallback } from "react";
import ConditionalOrientationGuard from "./components/ConditionalOrientationGuard";
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

// FIXED: Import from gameUtils.js
import { 
  GAME_CONSTANTS, 
  clamp, 
  getBallSpeed, 
  playBeep, 
  SOCKET_URL 
} from "./utils/gameUtils";

import "./PongGame.css";

const { WIDTH, HEIGHT, PADDLE_HEIGHT, PADDLE_WIDTH, BALL_SIZE, BASE_PADDLE_SPEED, BASE_BALL_SPEED, TRAIL_LEN } = GAME_CONSTANTS;

export default function PongGame() {
  // State variables
  const [leftPaddle, setLeftPaddle] = useState(HEIGHT/2 - PADDLE_HEIGHT/2);
  const [rightPaddle, setRightPaddle] = useState(HEIGHT/2 - PADDLE_HEIGHT/2);
  const [difficulty, setDifficulty] = useState(5);
  
  const [ball, setBall] = useState(() => {
    const initialSpeed = getBallSpeed(5);
    return {
      x: WIDTH/2 - BALL_SIZE/2, 
      y: HEIGHT/2 - BALL_SIZE/2,
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
  const [scores, setScores] = useState(() => JSON.parse(localStorage.getItem("pong-leaderboard")||"[]"));
  
  // Win Score
  const [winScore, setWinScore] = useState(5);

  // Multiplayer
  const [socket, setSocket] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [room, setRoom] = useState("");
  const [multiplayer, setMultiplayer] = useState(false);
  const [players, setPlayers] = useState(1);
  const [side, setSide] = useState("");

  // Enhanced Multiplayer States
  const [guestReady, setGuestReady] = useState(false);
  const [hostReady, setHostReady] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [gamePhase, setGamePhase] = useState("waiting");
  const [playMoreRequest, setPlayMoreRequest] = useState(null);
  const [showPlayMoreModal, setShowPlayMoreModal] = useState(false);

  // Chat
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  // Leaderboard modal
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Performance tracking
  const [fps, setFps] = useState(0);

  // Refs for smooth gameplay
  const keys = useRef({});
  const animationRef = useRef();
  const boardAreaRef = useRef();
  const [boardRect, setBoardRect] = useState(null);
  const lastFrameTime = useRef(0);
  const frameCount = useRef(0);
  const aiTargetRef = useRef(0);
  const aiUpdateCounter = useRef(0);
  const countdownRef = useRef(null);

  // Responsive sizing
  const [svgW, setSvgW] = useState(WIDTH), [svgH, setSvgH] = useState(HEIGHT);

  // Performance monitoring
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const checkPerformance = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(checkPerformance);
    };
    
    checkPerformance();
  }, []);

  // Update board rect for touch controls
  useEffect(() => {
    function updateRect() {
      if (boardAreaRef.current) setBoardRect(boardAreaRef.current.getBoundingClientRect());
    }
    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, []);

  // Key handling - prevent default only for game keys
  useEffect(() => {
    const down = (e) => { 
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        const gameKeys = ['w', 's', 'W', 'S', 'ArrowUp', 'ArrowDown'];
        if (gameKeys.includes(e.key)) {
          e.preventDefault();
        }
      }
      keys.current[e.key] = true; 
    };
    const up = (e) => { 
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        const gameKeys = ['w', 's', 'W', 'S', 'ArrowUp', 'ArrowDown'];
        if (gameKeys.includes(e.key)) {
          e.preventDefault();
        }
      }
      keys.current[e.key] = false; 
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
      let w = Math.min(window.innerWidth-20, WIDTH);
      let h = Math.round(w * HEIGHT/WIDTH);
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

  // Countdown effect
  useEffect(() => {
    if (countdown > 0) {
      countdownRef.current = setTimeout(() => {
        if (countdown === 1) {
          setCountdown(0);
          setGamePhase("playing");
          setRunning(true);
          playBeep(1200, 200, 0.15, isMuted);
        } else {
          setCountdown(countdown - 1);
          playBeep(800, 150, 0.1, isMuted);
        }
      }, 1000);
    }
    
    return () => {
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
    };
  }, [countdown, isMuted]);

  // Multiplayer functions with ready system
  function startMultiplayer(roomCode) {
    if (socket && room === roomCode && socket.connected) {
      console.log("Already connected to room:", roomCode);
      return;
    }
    
    if (socket) {
      console.log("Disconnecting from previous room...");
      socket.disconnect();
    }
    
    const s = io(SOCKET_URL, {
      transports: ['polling', 'websocket'], // ✅ Start with polling, upgrade to websocket
      upgrade: true,
      rememberUpgrade: false,
      timeout: 20000,
      forceNew: true,
      secure: true,
      rejectUnauthorized: false
    });
    
    
    setSocket(s);
    setRoom(roomCode);
    setMultiplayer(true);
    setTwoPlayer(false);
    setGamePhase("waiting");
    setGuestReady(false);
    setHostReady(false);
    
    console.log("Attempting to join room:", roomCode);
    s.emit("join", { room: roomCode });

    s.on("connect", () => {
      console.log("Connected to server, joining room:", roomCode);
    });

    s.on("connect_error", (error) => {
      console.error("Connection error:", error);
      console.error("Error message:", error.message);
      console.error("Trying to connect to:", SOCKET_URL);
      alert(`Failed to connect to multiplayer server: ${error.message}`);
    });

    s.on("players", count => {
      console.log("Players in room:", count);
      setPlayers(count);
      if (count === 2) {
        setGamePhase("ready");
      }
    });
    
    s.on("host", () => { 
      console.log("You are the host");
      setIsHost(true); 
      setSide("host"); 
    });
    
    s.on("side", _side => {
      console.log("Your side:", _side);
      setSide(_side);
      if (_side === "guest") {
        setIsHost(false);
      }
    });
    
    s.on("full", () => { 
      alert("Room is full"); 
      s.disconnect(); 
      setMultiplayer(false); 
      setIsHost(false); 
      setSide(""); 
    });

    // Ready system events
    s.on("guest_ready", () => {
      console.log("Guest is ready");
      setGuestReady(true);
    });

    s.on("start_countdown", () => {
      console.log("Starting countdown");
      setGamePhase("countdown");
      setCountdown(3);
    });

    s.on("play_more_request", (data) => {
      console.log("Play more request received:", data);
      setPlayMoreRequest(data);
      setShowPlayMoreModal(true);
    });

    s.on("play_more_accepted", () => {
      console.log("Play more accepted");
      setShowPlayMoreModal(false);
      setPlayMoreRequest(null);
      resetGame();
      setGamePhase("countdown");
      setCountdown(3);
    });

    s.on("play_more_declined", () => {
      console.log("Play more declined");
      setShowPlayMoreModal(false);
      setPlayMoreRequest(null);
    });

    // State synchronization for guest
    s.on("state_update", (state) => {
      console.log("Received state update:", state);
      if (!isHost) { // Only guest receives state updates
        setLeftPaddle(state.leftPaddle);
        setRightPaddle(state.rightPaddle);
        setBall(state.ball);
        setScore(state.score);
        setPowerUp(state.powerUp);
        setTrail(state.trail || []);
        if (state.winner) {
          setWinner(state.winner);
          setRunning(false);
          setGamePhase("finished");
        }
      }
    });

    // Host receives guest paddle input
    s.on("guest_paddle_input", (input) => {
      console.log("Host received guest paddle input:", input);
      if (isHost) {
        setLeftPaddle(input);
      }
    });

    s.on("chat", ({ msg, sender }) => {
      setChatMessages(msgs => [...msgs, { msg, sender }]);
    });

    s.on("disconnect", (reason, details) => {
      console.log("Disconnected:", reason, details);
      setMultiplayer(false);
      setSocket(null);
      setIsHost(false);
      setPlayers(1);
      setRoom("");
      setSide("");
      setGamePhase("waiting");
      setGuestReady(false);
      setHostReady(false);
      
      if (reason !== "io client disconnect") {
        alert(`Disconnected from multiplayer server: ${reason}`);
      }
    });
  }

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
    };
  }, [socket]);

  // Guest ready function
  function handleGuestReady() {
    if (socket && socket.connected && !isHost) {
      console.log("Guest sending ready signal");
      socket.emit("guest_ready", { room });
      setGuestReady(true);
    }
  }

  // Host start game function
  function handleHostStartGame() {
    if (socket && socket.connected && isHost && guestReady) {
      console.log("Host starting countdown");
      socket.emit("start_countdown", { room });
      setGamePhase("countdown");
      setCountdown(3);
    }
  }

  // Play more request function
  function handlePlayMoreRequest() {
    if (socket && socket.connected) {
      const requester = isHost ? "Host" : "Guest";
      socket.emit("play_more_request", { room, requester });
      console.log("Sent play more request");
    }
  }

  // Play more response functions
  function acceptPlayMore() {
    if (socket && socket.connected) {
      socket.emit("play_more_accepted", { room });
      setShowPlayMoreModal(false);
      setPlayMoreRequest(null);
      resetGame();
      setGamePhase("countdown");
      setCountdown(3);
    }
  }

  function declinePlayMore() {
    if (socket && socket.connected) {
      socket.emit("play_more_declined", { room });
      setShowPlayMoreModal(false);
      setPlayMoreRequest(null);
    }
  }

  // Reset game function
  function resetGame() {
    const initialSpeed = getBallSpeed(difficulty);
    const initialBall = {
      x: WIDTH/2-BALL_SIZE/2, 
      y: HEIGHT/2-BALL_SIZE/2,
      dx: (Math.random()>0.5?1:-1)*initialSpeed,
      dy: (Math.random()>0.5?1:-1)*initialSpeed,
      speed: initialSpeed
    };
    
    setScore({left:0, right:0});
    setBall(initialBall);
    setLeftPaddle(HEIGHT/2-PADDLE_HEIGHT/2);
    setRightPaddle(HEIGHT/2-PADDLE_HEIGHT/2);
    setWinner("");
    setTrail([]);
    setPowerUp(null);
    setPowerUpTimer(0);
    setRunning(false);
    
    // Reset AI counters
    aiUpdateCounter.current = 0;
    aiTargetRef.current = HEIGHT/2;
  }

  // handleStart function for single/two-player modes only
  function handleStart() {
    if (!multiplayer) {
      resetGame();
      setRunning(true);
      setGamePhase("playing");
    }
  }

  // Chat handling
  function handleSendChat(e) {
    e.preventDefault();
    if (socket && chatInput.trim()) {
      socket.emit("chat", { room, msg: chatInput.trim(), sender: side || "anon" });
      setChatInput("");
    }
  }

  // Paddle movement logic
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
    
    if (multiplayer) {
      if (isHost) {
        if (rUp || rUpTouch) {
          rPad -= paddleSpeed;
        }
        if (rDn || rDnTouch) {
          rPad += paddleSpeed;
        }
      } else {
        if (lUp || lUpTouch) {
          lPad -= paddleSpeed;
        }
        if (lDn || lDnTouch) {
          lPad += paddleSpeed;
        }
        return { lPad, rPad: rightPaddle };
      }
    } else if (twoPlayer) {
      if (lUp || lUpTouch) {
        lPad -= paddleSpeed;
      }
      if (lDn || lDnTouch) {
        lPad += paddleSpeed;
      }
      if (rUp || rUpTouch) {
        rPad -= paddleSpeed;
      }
      if (rDn || rDnTouch) {
        rPad += paddleSpeed;
      }
    } else {
      if (lUp || lUpTouch) {
        lPad -= paddleSpeed;
      }
      if (lDn || lDnTouch) {
        lPad += paddleSpeed;
      }
      
      // AI logic for right paddle
      const aiCenter = rPad + PADDLE_HEIGHT/2;
      const ballCenter = ball.y + BALL_SIZE/2;
      
      aiUpdateCounter.current++;
      if (aiUpdateCounter.current % 3 === 0) {
        const maxOffset = Math.max(2, 12 - difficulty * 1.5);
        const randomOffset = (Math.random() - 0.5) * maxOffset;
        aiTargetRef.current = ballCenter + randomOffset;
      }
      
      const difficultyMultiplier = Math.max(0.3, Math.min(2.0, 0.3 + (difficulty - 1) * 0.2));
      const aiSpeed = BASE_PADDLE_SPEED * difficultyMultiplier;
      
      const deadzone = Math.max(8, 20 - difficulty * 1.5);
      const distanceToTarget = Math.abs(aiCenter - aiTargetRef.current);
      
      if (distanceToTarget > deadzone) {
        if (aiCenter < aiTargetRef.current - deadzone) {
          rPad += aiSpeed;
        } else if (aiCenter > aiTargetRef.current + deadzone) {
          rPad -= aiSpeed;
        }
      }
    }
    
    lPad = clamp(lPad, 0, HEIGHT - PADDLE_HEIGHT);
    rPad = clamp(rPad, 0, HEIGHT - PADDLE_HEIGHT);
    
    return { lPad, rPad };
  }, [leftPaddle, rightPaddle, ball.y, difficulty, keyMap, touchDirL, touchDirR, multiplayer, isHost, twoPlayer]);

  // Game loop - only runs on host in multiplayer
  useEffect(() => {
    if (!running || isPaused || winner || gamePhase !== "playing") return;
    
    if (multiplayer && !isHost) {
      console.log("Guest - waiting for host game state updates");
      return;
    }

    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;

    function gameLoop(currentTime) {
      if (currentTime - lastFrameTime.current < frameInterval) {
        animationRef.current = requestAnimationFrame(gameLoop);
        return;
      }
      lastFrameTime.current = currentTime;
      frameCount.current++;

      const { lPad, rPad } = updatePaddles();
      
      let {x, y, dx, dy, speed} = ball;
      
      x += dx;
      y += dy;
      let curSpeed = Math.sqrt(dx*dx+dy*dy);

      // Trail update (optimized)
      if (frameCount.current % 2 === 0) {
        setTrail(trail => {
          let next = [{x, y}, ...trail];
          if (next.length > TRAIL_LEN) next.pop();
          return next;
        });
      }

      // Wall collisions
      if (y <= 0 || y+BALL_SIZE >= HEIGHT) {
        dy = -dy;
        playBeep(800, 60, 0.08, isMuted);
      }
      
      // Left paddle collision
      if (
        x <= PADDLE_WIDTH &&
        y+BALL_SIZE > lPad &&
        y < lPad+PADDLE_HEIGHT
      ) {
        x = PADDLE_WIDTH;
        let impact = (y + BALL_SIZE/2 - (lPad + PADDLE_HEIGHT/2)) / (PADDLE_HEIGHT/2);
        let angle = impact * Math.PI/4;
        let speedup = 1.05 + (difficulty - 5) * 0.005;
        curSpeed *= speedup;
        dx = Math.abs(curSpeed * Math.cos(angle));
        dy = curSpeed * Math.sin(angle);
        playBeep(400, 80, 0.08, isMuted);
      }
      
      // Right paddle collision
      if (
        x+BALL_SIZE >= WIDTH-PADDLE_WIDTH &&
        y+BALL_SIZE > rPad &&
        y < rPad+PADDLE_HEIGHT
      ) {
        x = WIDTH-PADDLE_WIDTH-BALL_SIZE;
        let impact = (y + BALL_SIZE/2 - (rPad + PADDLE_HEIGHT/2)) / (PADDLE_HEIGHT/2);
        let angle = impact * Math.PI/4;
        let speedup = 1.05 + (difficulty - 5) * 0.005;
        curSpeed *= speedup;
        dx = -Math.abs(curSpeed * Math.cos(angle));
        dy = curSpeed * Math.sin(angle);
        playBeep(200, 80, 0.08, isMuted);
      }

      // Power-up collision
      if (powerUp && x+BALL_SIZE > powerUp.x && x < powerUp.x+powerUp.size &&
          y+BALL_SIZE > powerUp.y && y < powerUp.y+powerUp.size) {
        if (powerUp.type === "enlarge") {
          setLeftPaddle(lPad => clamp(lPad, 0, HEIGHT-(PADDLE_HEIGHT*1.7)));
          setRightPaddle(rPad => clamp(rPad, 0, HEIGHT-(PADDLE_HEIGHT*1.7)));
        }
        if (powerUp.type === "shrink") {
          setLeftPaddle(lPad => clamp(lPad, 0, HEIGHT-(PADDLE_HEIGHT*0.7)));
          setRightPaddle(rPad => clamp(rPad, 0, HEIGHT-(PADDLE_HEIGHT*0.7)));
        }
        if (powerUp.type === "multi") {
          dx *= 1.5; dy *= 1.5;
        }
        setPowerUp(null);
        playBeep(1000, 120, 0.12, isMuted);
      }

      // Scoring logic
      let newScore = {...score};
      let scored = false, win = "";
      if (x < 0) {
        newScore.right += 1; scored = true;
        playBeep(120, 300, 0.18, isMuted);
        if (newScore.right >= winScore) win = "Right";
      } else if (x > WIDTH-BALL_SIZE) {
        newScore.left += 1; scored = true;
        playBeep(800, 300, 0.18, isMuted);
        if (newScore.left >= winScore) win = "Left";
      }
      
      if (scored) {
        const resetSpeed = getBallSpeed(difficulty);
        const resetBall = {
          x: WIDTH/2-BALL_SIZE/2, 
          y: HEIGHT/2-BALL_SIZE/2,
          dx: (Math.random()>0.5?1:-1)*resetSpeed,
          dy: (Math.random()>0.5?1:-1)*resetSpeed,
          speed: resetSpeed
        };
        
        setLeftPaddle(HEIGHT/2-PADDLE_HEIGHT/2);
        setRightPaddle(HEIGHT/2-PADDLE_HEIGHT/2);
        setBall(resetBall);
        setScore(newScore);
        setTrail([]);
        setPowerUp(null);
        setPowerUpTimer(0);
        
        if (win) {
          setWinner(win);
          setRunning(false);
          setGamePhase("finished");
          let now = new Date();
          let entry = {
            left: newScore.left, right: newScore.right, winner: win,
            date: now.toLocaleDateString()+" "+now.toLocaleTimeString()
          };
          let nextScores = [entry, ...scores].slice(0, 5);
          setScores(nextScores);
          localStorage.setItem("pong-leaderboard", JSON.stringify(nextScores));
        }
        
        // Send updated state to all players
        if (multiplayer && isHost && socket && socket.connected) {
          socket.emit("sync_state", { 
            room, 
            state: {
              leftPaddle: HEIGHT/2-PADDLE_HEIGHT/2,
              rightPaddle: HEIGHT/2-PADDLE_HEIGHT/2,
              ball: resetBall,
              score: newScore,
              powerUp: null,
              trail: [],
              winner: win,
              running: !win
            } 
          });
        }
        
        animationRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      // Update React state
      setLeftPaddle(lPad);
      setRightPaddle(rPad);
      setBall({ x, y, dx, dy, speed: curSpeed });

      // Power-up spawning
      if (!powerUp && (powerUpTimer > 200 + Math.random()*400)) {
        let px = Math.random()*(WIDTH-80)+40, py = Math.random()*(HEIGHT-60)+30;
        let types = ["enlarge","shrink","multi"];
        setPowerUp({
          x: px, y: py, size: 26, type: types[Math.floor(Math.random()*types.length)]
        });
        setPowerUpTimer(0);
      } else if (!powerUp) {
        setPowerUpTimer(t => t+1);
      }

      // Send complete game state to guest every frame
      if (multiplayer && isHost && socket && socket.connected) {
        socket.emit("sync_state", { 
          room, 
          state: {
            leftPaddle: lPad, 
            rightPaddle: rPad, 
            ball: { x, y, dx, dy, speed: curSpeed }, 
            score: newScore,
            powerUp, 
            trail, 
            winner, 
            running: true
          } 
        });
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    }
    
    animationRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationRef.current);
  }, [running, isPaused, winner, gamePhase, multiplayer, isHost, updatePaddles, ball, score, powerUp, powerUpTimer, winScore, isMuted, scores, socket, room, difficulty]);

  // Guest sends paddle input to host
  useEffect(() => {
    if (multiplayer && socket && socket.connected && !isHost && running) {
      console.log("Guest sending paddle input:", leftPaddle);
      socket.emit("paddle_input", { room, input: leftPaddle });
    }
  }, [leftPaddle, multiplayer, socket, isHost, room, running]);

  return (
    <ConditionalOrientationGuard twoPlayer={twoPlayer && !multiplayer}>
      <div className="pong-container" style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 50%, #0f0f0f 100%)",
        padding: "20px 10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        {/* Debug Info (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: 'rgba(0,0,0,0.8)',
            color: '#0ff',
            padding: '5px 10px',
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 9999
          }}>
            FPS: {fps} | Side: {side} | Host: {isHost ? 'Yes' : 'No'} | Players: {players}
            <br />
            Phase: {gamePhase} | L: {Math.round(leftPaddle)} | R: {Math.round(rightPaddle)}
          </div>
        )}

        {/* Countdown Display */}
        {countdown > 0 && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '120px',
            fontWeight: 'bold',
            color: '#0ff',
            textShadow: '0 0 30px rgba(0,255,255,0.8)',
            zIndex: 2000,
            animation: 'pulse 0.5s ease-in-out'
          }}>
            {countdown === 3 ? '3' : countdown === 2 ? '2' : countdown === 1 ? '1' : 'START!'}
          </div>
        )}

        {/* Play More Modal */}
        <Modal
          isOpen={showPlayMoreModal}
          onRequestClose={() => {
            setShowPlayMoreModal(false);
            setPlayMoreRequest(null);
          }}
          className="pong-modal"
          overlayClassName="pong-modal-overlay"
          ariaHideApp={false}
          style={{
            overlay: {
              backgroundColor: "rgba(0,0,0,0.95)",
              backdropFilter: "blur(15px)",
              zIndex: 2001
            },
            content: {
              background: "linear-gradient(145deg, #1a1a2e, #16213e)",
              border: "2px solid #0ff",
              borderRadius: "20px",
              color: "#fff",
              textAlign: "center",
              maxWidth: "400px",
              margin: "auto",
              boxShadow: "0 0 30px rgba(0,255,255,0.5)",
              zIndex: 2002
            }
          }}
        >
          <h2 style={{ fontSize: 24, margin: "0.5em 0", color: "#0ff" }}>
            🎮 Play More Request
          </h2>
          <p style={{ fontSize: 18, margin: "1em 0" }}>
            {playMoreRequest?.requester} wants to play more. Wanna join?
          </p>
          <div style={{ display: "flex", gap: "15px", justifyContent: "center", margin: "20px 0" }}>
            <button 
              className="pong-btn" 
              onClick={acceptPlayMore}
              style={{ background: "linear-gradient(45deg, #0f0, #0a0)" }}
            >
              ✅ Yes, Let's Play!
            </button>
            <button 
              className="pong-btn" 
              onClick={declinePlayMore}
              style={{ background: "linear-gradient(45deg, #f44, #a22)" }}
            >
              ❌ No Thanks
            </button>
          </div>
        </Modal>

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
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", margin: "20px 0", flexWrap: "wrap" }}>
            {multiplayer ? (
              <button 
                className="pong-btn" 
                onClick={handlePlayMoreRequest}
                style={{ background: "linear-gradient(45deg, #0f0, #0a0)" }}
              >
                🔄 Play More
              </button>
            ) : (
              <button className="pong-btn" onClick={handleStart}>🔄 Rematch</button>
            )}
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
          gamePhase={gamePhase}
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
          isPaused={isPaused} onPauseToggle={()=>setIsPaused(p=>!p)}
          isMuted={isMuted} onMuteToggle={()=>setIsMuted(m=>!m)}
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
            <KeyConfig keyMap={keyMap} setKeyMap={setKeyMap}/>
          </div>
        )}

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
          gamePhase={gamePhase}
          guestReady={guestReady}
          isHost={isHost}
          onGuestReady={handleGuestReady}
          onHostStart={handleHostStartGame}
        />

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
          <Leaderboard scores={scores}/>
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

        {/* Add CSS for animations */}
        <style jsx>{`
          @keyframes pulse {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    </ConditionalOrientationGuard>
  );
}

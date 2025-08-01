import React from "react";
import Modal from "react-modal";
import Leaderboard from "./Leaderboard";

export default function GameModals({ winner, score, showLeaderboard, scores, gameState }) {
  return (
    <>
      {/* Winner Modal */}
      <Modal isOpen={!!winner} /* ... winner modal */>
        {/* Winner modal content */}
      </Modal>

      {/* Leaderboard Modal */}
      <Modal isOpen={showLeaderboard} /* ... leaderboard modal */>
        <Leaderboard scores={scores} />
      </Modal>
    </>
  );
}

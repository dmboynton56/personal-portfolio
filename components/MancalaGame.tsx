import React, { useState } from "react";

// Types
const PITS_PER_PLAYER = 3;
const STONES_PER_PIT = 2;
const TOTAL_PITS = PITS_PER_PLAYER * 2 + 2; // 8 (6 pits + 2 mancalas)

type Player = 1 | 2;

type MancalaState = {
  board: number[];
  currentPlayer: Player;
  gameOver: boolean;
  winner: Player | 0; // 0 = tie/ongoing
};

function initBoard(): number[] {
  // [P1 pits..., P1 mancala, P2 pits..., P2 mancala]
  const board = Array(TOTAL_PITS).fill(STONES_PER_PIT);
  board[PITS_PER_PLAYER] = 0; // P1 mancala
  board[TOTAL_PITS - 1] = 0; // P2 mancala
  return board;
}

function getPitRange(player: Player) {
  if (player === 1) return [0, PITS_PER_PLAYER - 1];
  return [PITS_PER_PLAYER + 1, TOTAL_PITS - 2];
}

function getMancalaIdx(player: Player) {
  return player === 1 ? PITS_PER_PLAYER : TOTAL_PITS - 1;
}

function isValidMove(board: number[], pit: number, player: Player) {
  const [start, end] = getPitRange(player);
  return pit >= start && pit <= end && board[pit] > 0;
}

function isGameOver(board: number[]) {
  const p1Empty = board.slice(0, PITS_PER_PLAYER).every((v) => v === 0);
  const p2Empty = board.slice(PITS_PER_PLAYER + 1, TOTAL_PITS - 1).every((v) => v === 0);
  return p1Empty || p2Empty;
}

function sweepRemainingStones(board: number[]): number[] {
  const newBoard = [...board];
  // Sweep P1
  const p1Mancala = getMancalaIdx(1);
  for (let i = 0; i < PITS_PER_PLAYER; i++) {
    newBoard[p1Mancala] += newBoard[i];
    newBoard[i] = 0;
  }
  // Sweep P2
  const p2Mancala = getMancalaIdx(2);
  for (let i = PITS_PER_PLAYER + 1; i < TOTAL_PITS - 1; i++) {
    newBoard[p2Mancala] += newBoard[i];
    newBoard[i] = 0;
  }
  return newBoard;
}

function getWinner(board: number[]): Player | 0 {
  const p1 = board[getMancalaIdx(1)];
  const p2 = board[getMancalaIdx(2)];
  if (p1 > p2) return 1;
  if (p2 > p1) return 2;
  return 0;
}

export default function MancalaGame() {
  const [board, setBoard] = useState<number[]>(initBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>(1);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Player | 0>(0);

  function handlePitClick(pitIdx: number) {
    if (gameOver || !isValidMove(board, pitIdx, currentPlayer)) return;
    let newBoard = [...board];
    let stones = newBoard[pitIdx];
    newBoard[pitIdx] = 0;
    let idx = pitIdx;
    while (stones > 0) {
      idx = (idx + 1) % TOTAL_PITS;
      // Skip opponent's mancala
      if (
        (currentPlayer === 1 && idx === TOTAL_PITS - 1) ||
        (currentPlayer === 2 && idx === PITS_PER_PLAYER)
      ) {
        idx = (idx + 1) % TOTAL_PITS;
      }
      newBoard[idx] += 1;
      stones -= 1;
    }
    // Capture rule
    const [start, end] = getPitRange(currentPlayer);
    if (
      idx >= start && idx <= end &&
      newBoard[idx] === 1 &&
      board[idx] === 0
    ) {
      // Opposite pit calculation
      // For 3 pits: [0,1,2] <-> [6,5,4]
      // idx: 0 -> 6, 1 -> 5, 2 -> 4
      // idx: 4 -> 2, 5 -> 1, 6 -> 0
      let oppIdx = TOTAL_PITS - 2 - idx;
      if (newBoard[oppIdx] > 0) {
        const mancalaIdx = getMancalaIdx(currentPlayer);
        newBoard[mancalaIdx] += newBoard[oppIdx] + 1;
        newBoard[idx] = 0;
        newBoard[oppIdx] = 0;
      }
    }
    // Check for game over
    if (isGameOver(newBoard)) {
      // Sweep remaining stones
      newBoard = sweepRemainingStones(newBoard);
      setBoard(newBoard);
      setGameOver(true);
      setWinner(getWinner(newBoard));
      return;
    }
    // Switch player
    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-background py-8">
      <div className="bg-[#e7cba9] rounded-3xl shadow-2xl px-8 py-6 flex items-center" style={{ minWidth: 420 }}>
        {/* Left Mancala */}
        <MancalaPit stones={board[PITS_PER_PLAYER]} />
        {/* Main pits */}
        <div className="flex flex-col mx-4">
          {/* Top row (Player 2 pits) */}
          <div className="flex flex-row justify-center mb-2">
            {board.slice(PITS_PER_PLAYER + 1, TOTAL_PITS - 1).map((stones, idx) => (
              <Pit
                key={idx}
                stones={stones}
                onClick={() => handlePitClick(PITS_PER_PLAYER + 1 + idx)}
                clickable={!gameOver && currentPlayer === 2 && isValidMove(board, PITS_PER_PLAYER + 1 + idx, 2)}
              />
            ))}
          </div>
          {/* Bottom row (Player 1 pits) */}
          <div className="flex flex-row justify-center mt-2">
            {board.slice(0, PITS_PER_PLAYER).map((stones, idx) => (
              <Pit
                key={idx}
                stones={stones}
                onClick={() => handlePitClick(idx)}
                clickable={!gameOver && currentPlayer === 1 && isValidMove(board, idx, 1)}
              />
            ))}
          </div>
        </div>
        {/* Right Mancala */}
        <MancalaPit stones={board[TOTAL_PITS - 1]} />
      </div>
      <div className="absolute left-0 right-0 bottom-4 text-center">
        {gameOver ? (
          <span className="text-lg font-bold text-[#7c5a36]">
            {winner === 0 ? "It's a tie!" : `Player ${winner} wins!`}
          </span>
        ) : (
          <span className="text-lg font-bold text-[#7c5a36]">
            Current Player: {currentPlayer}
          </span>
        )}
      </div>
    </div>
  );
}

function Pit({ stones, onClick, clickable = false }: { stones: number; onClick?: () => void; clickable?: boolean }) {
  return (
    <button
      className={`relative flex items-center justify-center w-14 h-14 bg-[#7c5a36] rounded-full shadow-md mx-2 transition-transform ${
        clickable ? 'hover:scale-105 cursor-pointer' : 'cursor-default opacity-70'
      }`}
      onClick={clickable ? onClick : undefined}
      disabled={!clickable}
      type="button"
    >
      <div className="absolute flex flex-wrap justify-center items-center w-full h-full">
        {Array.from({ length: stones }).map((_, i) => (
          <span
            key={i}
            className="w-3 h-3 rounded-full bg-[#f5f3ee] shadow-sm m-0.5"
            style={{ boxShadow: "2px 2px 6px 0px #bfa77a" }}
          />
        ))}
      </div>
    </button>
  );
}

function MancalaPit({ stones }: { stones: number }) {
  return (
    <div
      className="relative flex items-center justify-center w-20 h-32 bg-[#7c5a36] rounded-3xl shadow-lg mx-2"
    >
      <div className="absolute flex flex-wrap justify-center items-center w-full h-full">
        {Array.from({ length: stones }).map((_, i) => (
          <span
            key={i}
            className="w-3 h-3 rounded-full bg-[#f5f3ee] shadow-sm m-0.5"
            style={{ boxShadow: "2px 2px 6px 0px #bfa77a" }}
          />
        ))}
      </div>
    </div>
  );
}
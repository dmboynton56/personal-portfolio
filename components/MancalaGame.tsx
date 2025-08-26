import React, { useState, useEffect, useMemo } from "react";

const PITS_PER_PLAYER = 3;
const STONES_PER_PIT = 2;
const TOTAL_PITS = PITS_PER_PLAYER * 2 + 2; // 8 (6 pits + 2 mancalas)
type Player = 1 | 2;
type State = { board: number[]; currentPlayer: Player };
type Stats = { p1Wins: number; p2Wins: number; ties: number };
function readStats(): Stats {
  try { return JSON.parse(localStorage.getItem('mancalaStats') || '') as Stats; }
  catch { return { p1Wins: 0, p2Wins: 0, ties: 0 }; }
}
function writeStats(s: Stats) { localStorage.setItem('mancalaStats', JSON.stringify(s)); }
function initBoard(): number[] {
  const board = Array(TOTAL_PITS).fill(STONES_PER_PIT);
  board[PITS_PER_PLAYER] = 0;
  board[TOTAL_PITS - 1] = 0;
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
  const p1Mancala = getMancalaIdx(1);
  for (let i = 0; i < PITS_PER_PLAYER; i++) {
    newBoard[p1Mancala] += newBoard[i];
    newBoard[i] = 0;
  }
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
function getValidMoves(state: State): number[] {
  const [start, end] = getPitRange(state.currentPlayer);
  const res: number[] = [];
  for (let i = start; i <= end; i++) if (state.board[i] > 0) res.push(i);
  return res;
}
function applyMove(state: State, pitIdx: number): {
  board: number[];
  nextPlayer: Player;
  landedInOwnMancala: boolean;
  gameOver: boolean;
} {
  const before = state.board;
  const board = [...before];
  let stones = board[pitIdx];
  board[pitIdx] = 0;
  let idx = pitIdx;
  while (stones > 0) {
    idx = (idx + 1) % TOTAL_PITS;
    if (
      (state.currentPlayer === 1 && idx === TOTAL_PITS - 1) ||
      (state.currentPlayer === 2 && idx === PITS_PER_PLAYER)
    ) {
      idx = (idx + 1) % TOTAL_PITS;
    }
    board[idx] += 1;
    stones -= 1;
  }
  const [start, end] = getPitRange(state.currentPlayer);
  const landedOnOwnSide = idx >= start && idx <= end;
  const wasEmptyBefore = before[idx] === 0;
  const nowHasOne = board[idx] === 1;
  if (landedOnOwnSide && wasEmptyBefore && nowHasOne) {
    const oppIdx = TOTAL_PITS - 2 - idx;
    if (board[oppIdx] > 0) {
      const mancalaIdx = getMancalaIdx(state.currentPlayer);
      board[mancalaIdx] += board[oppIdx] + board[idx];
      board[oppIdx] = 0;
      board[idx] = 0;
    }
  }
  const landedInOwnMancala = idx === getMancalaIdx(state.currentPlayer);
  const nextPlayer: Player = landedInOwnMancala ? state.currentPlayer : (state.currentPlayer === 1 ? 2 : 1);
  const gameOver = isGameOver(board);
  return { board, nextPlayer, landedInOwnMancala, gameOver };
}
function evaluateBoard(board: number[]): number {
  const b = isGameOver(board) ? sweepRemainingStones([...board]) : board;
  const p1 = b[getMancalaIdx(1)];
  const p2 = b[getMancalaIdx(2)];
  return p1 - p2;
}
class MancalaAI {
  constructor(public depth: number) {}
  bestMove(state: State, useAlphaBeta = true): number | null {
    const moves = getValidMoves(state);
    if (moves.length === 0) return null;
    let bestMove: number | null = null;
    let bestVal = state.currentPlayer === 1 ? -Infinity : Infinity;
    for (const m of moves) {
      const sim = applyMove(state, m);
      const val = useAlphaBeta
        ? this.alphaBeta(
            { board: sim.board, currentPlayer: sim.nextPlayer },
            this.depth - 1,
            -Infinity,
            Infinity
          )
        : this.minimax(
            { board: sim.board, currentPlayer: sim.nextPlayer },
            this.depth - 1
          );
      if (state.currentPlayer === 1) {
        if (val > bestVal) { bestVal = val; bestMove = m; }
      } else {
        if (val < bestVal) { bestVal = val; bestMove = m; }
      }
    }
    return bestMove;
  }
  private minimax(state: State, depth: number): number {
    if (depth === 0 || isGameOver(state.board)) {
      return evaluateBoard(state.board);
    }
    const moves = getValidMoves(state);
    if (moves.length === 0) return evaluateBoard(state.board);
    const maximizing = state.currentPlayer === 1;
    if (maximizing) {
      let maxEval = -Infinity;
      for (const m of moves) {
        const { board, nextPlayer } = applyMove(state, m);
        const evalVal = this.minimax({ board, currentPlayer: nextPlayer }, depth - 1);
        if (evalVal > maxEval) maxEval = evalVal;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const m of moves) {
        const { board, nextPlayer } = applyMove(state, m);
        const evalVal = this.minimax({ board, currentPlayer: nextPlayer }, depth - 1);
        if (evalVal < minEval) minEval = evalVal;
      }
      return minEval;
    }
  }
  private alphaBeta(state: State, depth: number, alpha: number, beta: number): number {
    if (depth === 0 || isGameOver(state.board)) {
      return evaluateBoard(state.board);
    }
    const moves = getValidMoves(state);
    if (moves.length === 0) return evaluateBoard(state.board);
    const maximizing = state.currentPlayer === 1;
    if (maximizing) {
      let value = -Infinity;
      for (const m of moves) {
        const { board, nextPlayer } = applyMove(state, m);
        const evalVal = this.alphaBeta({ board, currentPlayer: nextPlayer }, depth - 1, alpha, beta);
        if (evalVal > value) value = evalVal;
        if (value > alpha) alpha = value;
        if (alpha >= beta) break;
      }
      return value;
    } else {
      let value = Infinity;
      for (const m of moves) {
        const { board, nextPlayer } = applyMove(state, m);
        const evalVal = this.alphaBeta({ board, currentPlayer: nextPlayer }, depth - 1, alpha, beta);
        if (evalVal < value) value = evalVal;
        if (value < beta) beta = value;
        if (alpha >= beta) break;
      }
      return value;
    }
  }
}

export default function MancalaGame() {
  const [board, setBoard] = useState<number[]>(initBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>(1);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Player | 0>(0);
  const [vsAI, setVsAI] = useState(true);
  const aiDepth = 8; // Fixed depth
  const ai = useMemo(() => new MancalaAI(aiDepth), [aiDepth]);
  const [suggestedPit, setSuggestedPit] = useState<number | null>(null);
  const [stats, setStats] = useState<Stats>({ p1Wins: 0, p2Wins: 0, ties: 0 });

  // Only read stats from localStorage on client
  useEffect(() => {
    setStats(readStats());
  }, []);

  function commitMove(pitIdx: number) {
    if (gameOver) return;
    if (!isValidMove(board, pitIdx, currentPlayer)) return;
    const res = applyMove({ board, currentPlayer }, pitIdx);
    let nextBoard = res.board;
    let nextPlayer = res.nextPlayer;
    if (isGameOver(nextBoard)) {
      nextBoard = sweepRemainingStones(nextBoard);
      setBoard(nextBoard);
      setGameOver(true);
      setWinner(getWinner(nextBoard));
      setSuggestedPit(null);
      return;
    }
    setBoard(nextBoard);
    setCurrentPlayer(nextPlayer);
    setSuggestedPit(null);
  }
  function handlePitClick(pitIdx: number) {
    if (vsAI && currentPlayer !== 1) return;
    commitMove(pitIdx);
  }
  function restart() {
    const fresh = initBoard();
    setBoard(fresh);
    setCurrentPlayer(1);
    setGameOver(false);
    setWinner(0);
    setSuggestedPit(null);
  }
  function suggest() {
    if (gameOver) return;
    const move = ai.bestMove({ board, currentPlayer });
    setSuggestedPit(move ?? null);
  }
  useEffect(() => {
    if (!vsAI || gameOver || currentPlayer !== 2) return;
    const move = ai.bestMove({ board, currentPlayer });
    if (move == null) return;
    const t = setTimeout(() => {
      commitMove(move);
    }, 250);
    return () => clearTimeout(t);
  }, [vsAI, gameOver, currentPlayer, board, ai]);
  useEffect(() => {
    if (!gameOver) return;
    setStats(prev => {
      const next = { ...prev };
      if (winner === 1) next.p1Wins++;
      else if (winner === 2) next.p2Wins++;
      else next.ties++;
      writeStats(next);
      return next;
    });
  }, [gameOver, winner]);
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-background py-8">
      <div className="flex flex-row items-center justify-center gap-8">
        {/* Left: Play vs AI toggle */}
        <div className="flex flex-col items-center justify-center min-w-[160px]">
          <label className="flex items-center gap-3 text-lg font-semibold select-none">
            <input
              type="checkbox"
              checked={vsAI}
              onChange={e => setVsAI(e.target.checked)}
              className="w-6 h-6 accent-yellow-500 border-2 border-[#7c5a36] rounded focus:ring-2 focus:ring-yellow-400"
            />
            Play vs AI
          </label>
        </div>
        {/* Center: Board */}
        <div className="bg-[#e7cba9] rounded-3xl shadow-2xl px-8 py-6 flex items-center">
          {/* Left Mancala */}
          <MancalaPit stones={board[PITS_PER_PLAYER]} />
          {/* Main pits */}
          <div className="flex flex-col mx-4">
            {/* Top row (Player 2 pits) */}
            <div className="flex flex-row justify-center mb-2">
              {board.slice(PITS_PER_PLAYER + 1, TOTAL_PITS - 1).map((stones, idx) => {
                const pitIndex = PITS_PER_PLAYER + 1 + idx;
                return (
                  <Pit
                    key={pitIndex}
                    stones={stones}
                    pitIndex={pitIndex}
                    suggested={suggestedPit === pitIndex}
                    onClick={() => handlePitClick(pitIndex)}
                    clickable={!gameOver && currentPlayer === 2 && isValidMove(board, pitIndex, 2)}
                  />
                );
              })}
            </div>
            {/* Bottom row (Player 1 pits) - REVERSED for correct UI mapping */}
            <div className="flex flex-row justify-center mt-2">
              {board.slice(0, PITS_PER_PLAYER).slice().reverse().map((stones, idx) => {
                const pitIndex = PITS_PER_PLAYER - 1 - idx;
                return (
                  <Pit
                    key={pitIndex}
                    stones={stones}
                    pitIndex={pitIndex}
                    suggested={suggestedPit === pitIndex}
                    onClick={() => handlePitClick(pitIndex)}
                    clickable={!gameOver && currentPlayer === 1 && isValidMove(board, pitIndex, 1)}
                  />
                );
              })}
            </div>
          </div>
          {/* Right Mancala */}
          <MancalaPit stones={board[TOTAL_PITS - 1]} />
        </div>
        {/* Right: Win tracker */}
        <div className="flex flex-col items-center justify-center min-w-[180px]">
          <div className="bg-[#f5e6d6] rounded-xl shadow-md px-6 py-4 text-center">
            <div className="text-lg font-bold text-[#7c5a36] mb-2">Win Tracker</div>
            <div className="text-base text-[#7c5a36] font-semibold">P1 Wins: <span className="text-green-700 font-bold">{stats.p1Wins}</span></div>
            <div className="text-base text-[#7c5a36] font-semibold">P2 Wins: <span className="text-blue-700 font-bold">{stats.p2Wins}</span></div>
            <div className="text-base text-[#7c5a36] font-semibold">Ties: <span className="text-gray-700 font-bold">{stats.ties}</span></div>
          </div>
        </div>
      </div>
      {/* Buttons below the board */}
      <div className="flex gap-6 mt-8">
        <button className="btn bg-[#7c5a36] text-white px-8 py-3 rounded text-lg font-bold shadow hover:bg-[#a67c52] transition" onClick={restart}>Restart</button>
        <button className="btn bg-yellow-500 text-white px-8 py-3 rounded text-lg font-bold shadow hover:bg-yellow-600 transition" onClick={suggest}>Suggest Move</button>
      </div>
      <div className="mt-8 text-lg font-bold text-[#7c5a36] text-center">
        {gameOver ? (
          <span>
            {winner === 0 ? "It's a tie!" : `Player ${winner} wins!`}
          </span>
        ) : (
          <span>
            Current Player: {currentPlayer}
          </span>
        )}
      </div>
    </div>
  );
}

function Pit({ stones, pitIndex, suggested = false, onClick, clickable = false }: {
  stones: number;
  pitIndex: number;
  suggested?: boolean;
  onClick?: () => void;
  clickable?: boolean;
}) {
  return (
    <button
      className={`relative flex items-center justify-center w-14 h-14 rounded-full shadow-md mx-2 transition-transform
        ${clickable ? 'hover:scale-105 cursor-pointer' : 'cursor-default opacity-70'}
        ${suggested ? 'ring-4 ring-yellow-400 ring-offset-2' : ''}
      `}
      onClick={clickable ? onClick : undefined}
      disabled={!clickable}
      type="button"
      style={{ background: '#7c5a36' }}
    >
      <div className="absolute flex flex-wrap justify-center items-center w-full h-full">
        {Array.from({ length: stones }).map((_, i) => (
          <span key={i} className="w-3 h-3 rounded-full bg-[#f5f3ee] shadow-sm m-0.5" style={{ boxShadow: '2px 2px 6px 0px #bfa77a' }} />
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
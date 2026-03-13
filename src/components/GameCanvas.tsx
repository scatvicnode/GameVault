"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { SpaceDefenderEngine, type GameState } from "@/lib/game-engine";
import { saveHighScore, getHighScores, type HighScore } from "@/lib/shelby";

interface GameCanvasProps {
  walletAddress: string | null;
}

export default function GameCanvas({ walletAddress }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<SpaceDefenderEngine | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    running: false,
    paused: false,
    score: 0,
    lives: 3,
    level: 1,
    gameOver: false,
  });
  const [highScores, setHighScores] = useState<HighScore[]>([]);

  // Load high scores
  useEffect(() => {
    setHighScores(getHighScores("space-defender"));
  }, []);

  // Initialize engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 480;
    canvas.height = 640;

    const engine = new SpaceDefenderEngine(canvas, {
      onScoreChange: () => {},
      onGameOver: (score: number) => {
        const playerName = walletAddress
          ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
          : "Anonymous";

        saveHighScore({
          player: playerName,
          score,
          timestamp: new Date().toISOString(),
          game: "space-defender",
        });
        setHighScores(getHighScores("space-defender"));
      },
      onStateChange: (state: GameState) => {
        setGameState({ ...state });
      },
    });

    engineRef.current = engine;

    // Draw initial screen
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#0a0a1a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars
      for (let i = 0; i < 80; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.5 + 0.2})`;
        ctx.fillRect(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          Math.random() * 2 + 0.5,
          Math.random() * 2 + 0.5
        );
      }

      ctx.fillStyle = "#00ff88";
      ctx.font = "bold 28px monospace";
      ctx.textAlign = "center";
      ctx.fillText("SPACE DEFENDER", canvas.width / 2, canvas.height / 2 - 40);

      ctx.fillStyle = "#8b5cf6";
      ctx.font = "14px monospace";
      ctx.fillText(
        "Powered by Shelby Protocol",
        canvas.width / 2,
        canvas.height / 2
      );

      ctx.fillStyle = "#ffffff";
      ctx.font = "16px monospace";
      ctx.fillText(
        "Press START to begin",
        canvas.width / 2,
        canvas.height / 2 + 40
      );

      ctx.fillStyle = "#666666";
      ctx.font = "12px monospace";
      ctx.fillText(
        "Arrow Keys / WASD to move",
        canvas.width / 2,
        canvas.height / 2 + 70
      );
      ctx.fillText(
        "SPACE to shoot",
        canvas.width / 2,
        canvas.height / 2 + 90
      );
    }

    return () => {
      engine.destroy();
    };
  }, [walletAddress]);

  const handleStart = useCallback(() => {
    engineRef.current?.start();
  }, []);

  const handlePause = useCallback(() => {
    engineRef.current?.pause();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
      {/* Game Area */}
      <div className="flex flex-col items-center gap-4">
        {/* HUD */}
        <div className="flex items-center gap-6 bg-gray-900/80 rounded-lg px-6 py-3 border border-purple-500/20">
          <div className="text-center">
            <div className="text-xs text-gray-400 uppercase">Score</div>
            <div className="text-xl font-bold text-cyan-400 font-mono">
              {gameState.score}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 uppercase">Lives</div>
            <div className="text-xl font-bold text-red-400 font-mono">
              {"❤️".repeat(gameState.lives)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 uppercase">Level</div>
            <div className="text-xl font-bold text-purple-400 font-mono">
              {gameState.level}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="relative rounded-xl overflow-hidden border-2 border-purple-500/30 shadow-lg shadow-purple-500/10">
          <canvas
            ref={canvasRef}
            className="block bg-gray-950"
            style={{ width: 480, height: 640 }}
          />
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <button
            onClick={handleStart}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold hover:opacity-90 transition-opacity text-sm"
          >
            {gameState.gameOver || !gameState.running ? "▶ START" : "↻ RESTART"}
          </button>
          {gameState.running && !gameState.gameOver && (
            <button
              onClick={handlePause}
              className="px-6 py-2.5 rounded-lg bg-gray-700 text-white font-bold hover:bg-gray-600 transition-colors text-sm"
            >
              {gameState.paused ? "▶ RESUME" : "⏸ PAUSE"}
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 text-center max-w-md">
          🎮 Arrow Keys or WASD to move · Space to shoot · Collect power-ups ·
          High scores stored on Shelby
        </p>
      </div>

      {/* Leaderboard */}
      <div className="w-full lg:w-72 bg-gray-900/60 rounded-xl border border-purple-500/20 p-4">
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          🏆 Leaderboard
        </h3>

        {highScores.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            No scores yet. Be the first!
          </p>
        ) : (
          <div className="space-y-2">
            {highScores.map((entry, i) => (
              <div
                key={`${entry.timestamp}-${i}`}
                className={`flex items-center justify-between p-2 rounded-lg ${
                  i === 0
                    ? "bg-yellow-500/10 border border-yellow-500/30"
                    : i === 1
                      ? "bg-gray-400/10 border border-gray-400/30"
                      : i === 2
                        ? "bg-amber-700/10 border border-amber-700/30"
                        : "bg-gray-800/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-400 w-5">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                  </span>
                  <span className="text-xs text-gray-300 font-mono">
                    {entry.player}
                  </span>
                </div>
                <span className="text-sm font-bold text-cyan-400 font-mono">
                  {entry.score}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 p-3 bg-purple-900/20 rounded-lg border border-purple-500/20">
          <p className="text-xs text-purple-300">
            💾 High scores are saved via Shelby Protocol&apos;s decentralized storage.
            {walletAddress
              ? " Your wallet is connected!"
              : " Connect wallet to claim your scores."}
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import Navbar from "@/components/Navbar";
import GameCanvas from "@/components/GameCanvas";
import { useWallet } from "@/hooks/useWallet";

export default function GamePage() {
  const { connected, address, connect } = useWallet();

  return (
    <div className="min-h-screen bg-[#050510]">
      <Navbar />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              🎮 Space Defender — Storage Demo
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto">
              A showcase of Shelby&apos;s decentralized storage in action. High
              scores are stored as blobs on the Shelby network, linked to your
              Aptos wallet.
            </p>
          </div>

          {/* Wallet connection prompt */}
          {!connected && (
            <div className="max-w-lg mx-auto mb-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-center">
              <p className="text-yellow-300 text-sm mb-3">
                🔗 Connect your wallet to claim your scores on the leaderboard!
              </p>
              <button
                onClick={connect}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Connect Wallet
              </button>
            </div>
          )}

          {/* Game */}
          <GameCanvas walletAddress={address} />

          {/* Game Info */}
          <div className="max-w-3xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900/60 rounded-xl border border-purple-500/20 p-4">
              <h3 className="text-sm font-bold text-purple-400 mb-2">
                🎯 Enemies
              </h3>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>
                  <span className="text-red-400">■</span> Basic — 10pts, slow
                </li>
                <li>
                  <span className="text-yellow-400">▲</span> Fast — 25pts,
                  quick
                </li>
                <li>
                  <span className="text-purple-400">●</span> Tank — 50pts,
                  tough
                </li>
              </ul>
            </div>
            <div className="bg-gray-900/60 rounded-xl border border-cyan-500/20 p-4">
              <h3 className="text-sm font-bold text-cyan-400 mb-2">
                ⚡ Power-Ups
              </h3>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>
                  <span className="text-blue-400">S</span> Shield — 5s
                  protection
                </li>
                <li>
                  <span className="text-orange-400">R</span> Rapid Fire — 5s
                  fast shots
                </li>
                <li>
                  <span className="text-green-400">+</span> Extra Life — +1
                  heart
                </li>
              </ul>
            </div>
            <div className="bg-gray-900/60 rounded-xl border border-green-500/20 p-4">
              <h3 className="text-sm font-bold text-green-400 mb-2">
                💾 Shelby Storage
              </h3>
              <p className="text-xs text-gray-400">
                High scores are saved as JSON blobs on Shelby&apos;s decentralized
                network. Your scores are linked to your Aptos wallet address.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

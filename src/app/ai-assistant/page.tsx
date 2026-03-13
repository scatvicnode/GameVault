"use client";

import Navbar from "@/components/Navbar";
import AiChat from "@/components/AiChat";

export default function AiAssistantPage() {
  return (
    <div className="min-h-screen bg-[#050510]">
      <Navbar />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              🤖 AI Game Dev Assistant
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto">
              Get AI-powered help building games on Shelby Protocol. Ask about
              asset uploads, game mechanics, Web3 integration, and more.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat */}
            <div className="lg:col-span-2">
              <AiChat />
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* AI Model Info */}
              <div className="bg-gray-900/60 rounded-xl border border-purple-500/20 p-4">
                <h3 className="text-sm font-bold text-purple-400 mb-3">
                  🧠 AI Model: GPT-4o-mini
                </h3>
                <ul className="text-xs text-gray-400 space-y-2">
                  <li>✅ Fast responses (low latency)</li>
                  <li>✅ Good for code generation</li>
                  <li>✅ Cost-efficient for chat</li>
                  <li>✅ Supports multi-turn conversation</li>
                </ul>
              </div>

              {/* Suggested Topics */}
              <div className="bg-gray-900/60 rounded-xl border border-cyan-500/20 p-4">
                <h3 className="text-sm font-bold text-cyan-400 mb-3">
                  💡 Try Asking About
                </h3>
                <ul className="text-xs text-gray-400 space-y-2">
                  <li>🔗 Shelby blob upload flow</li>
                  <li>🎮 HTML5 Canvas game patterns</li>
                  <li>💰 ShelbyUSD funding on testnet</li>
                  <li>🏆 On-chain leaderboard design</li>
                  <li>🖼️ Game asset pipeline</li>
                  <li>🤖 Best AI models for game NPCs</li>
                  <li>📡 Shelby RPC vs Indexer API</li>
                </ul>
              </div>

              {/* Recommended AI Models */}
              <div className="bg-gray-900/60 rounded-xl border border-green-500/20 p-4">
                <h3 className="text-sm font-bold text-green-400 mb-3">
                  🤖 Recommended AI Models for Games
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-gray-300 font-medium">NPC Dialogue</span>
                    <p className="text-gray-500">GPT-4o-mini — fast, cheap, conversational</p>
                  </div>
                  <div>
                    <span className="text-gray-300 font-medium">Asset Generation</span>
                    <p className="text-gray-500">Stable Diffusion XL — sprites, textures</p>
                  </div>
                  <div>
                    <span className="text-gray-300 font-medium">Level Design</span>
                    <p className="text-gray-500">GPT-4o — complex procedural generation</p>
                  </div>
                  <div>
                    <span className="text-gray-300 font-medium">Game Balance</span>
                    <p className="text-gray-500">PPO (RL) — self-play difficulty tuning</p>
                  </div>
                  <div>
                    <span className="text-gray-300 font-medium">Voice/Audio</span>
                    <p className="text-gray-500">ElevenLabs — NPC voice, sound FX</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

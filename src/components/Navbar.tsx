"use client";

import Link from "next/link";
import { useWallet } from "@/hooks/useWallet";

export default function Navbar() {
  const { connected, address, connecting, connect, disconnect, error } =
    useWallet();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform">
              S
            </div>
            <span className="text-lg font-bold text-white">
              Shelby<span className="text-purple-400">GameVault</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/game"
              className="text-gray-300 hover:text-purple-400 transition-colors text-sm font-medium"
            >
              🎮 Demo
            </Link>
            <Link
              href="/assets"
              className="text-gray-300 hover:text-purple-400 transition-colors text-sm font-medium"
            >
              📦 Assets
            </Link>
            <Link
              href="/gallery"
              className="text-gray-300 hover:text-purple-400 transition-colors text-sm font-medium"
            >
              🖼️ Gallery
            </Link>
            <Link
              href="/ai-assistant"
              className="text-gray-300 hover:text-purple-400 transition-colors text-sm font-medium"
            >
              🤖 AI Assistant
            </Link>
            <Link
              href="/status"
              className="text-gray-300 hover:text-purple-400 transition-colors text-sm font-medium"
            >
              📡 Status
            </Link>
          </div>

          {/* Wallet */}
          <div className="flex items-center gap-3">
            {connected ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-1.5 border border-purple-500/30">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-gray-300 font-mono">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>
                <button
                  onClick={disconnect}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition-colors border border-red-500/30"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-end">
                <button
                  onClick={connect}
                  disabled={connecting}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {connecting ? "Connecting..." : "Connect Wallet"}
                </button>
                {error && (
                  <span className="text-[10px] text-red-400 mt-1 max-w-[180px] truncate">
                    {error}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex items-center justify-center gap-4 pb-2 px-4">
        <Link
          href="/game"
          className="text-gray-400 hover:text-purple-400 transition-colors text-xs"
        >
          🎮 Demo
        </Link>
        <Link
          href="/assets"
          className="text-gray-400 hover:text-purple-400 transition-colors text-xs"
        >
          📦 Assets
        </Link>
        <Link
          href="/gallery"
          className="text-gray-400 hover:text-purple-400 transition-colors text-xs"
        >
          🖼️ Gallery
        </Link>
        <Link
          href="/ai-assistant"
          className="text-gray-400 hover:text-purple-400 transition-colors text-xs"
        >
          🤖 AI
        </Link>
        <Link
          href="/status"
          className="text-gray-400 hover:text-purple-400 transition-colors text-xs"
        >
          📡 Status
        </Link>
      </div>
    </nav>
  );
}

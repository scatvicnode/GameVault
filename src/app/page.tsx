"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { FeatureCard, StatCard, StepCard } from "@/components/Cards";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050510]">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-20 px-4 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm mb-6">
            🚀 Built on Shelby Protocol × Aptos Blockchain
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-green-400 bg-clip-text text-transparent animate-gradient">
              ShelbyGameVault
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
            Build & Store Game Assets on Decentralized Storage
          </p>
          <p className="text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Upload sprites, audio, maps, and configs to Shelby Protocol&apos;s
            decentralized storage. Manage your entire game asset library with
            Aptos wallet ownership — all on-chain, accessible anywhere.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/assets"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-lg hover:opacity-90 transition-opacity glow-purple"
            >
              📦 Upload Assets
            </Link>
            <Link
              href="/gallery"
              className="px-8 py-3.5 rounded-xl bg-gray-800 text-white font-bold text-lg hover:bg-gray-700 transition-colors border border-gray-700"
            >
              🖼️ Browse Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 border-y border-purple-500/10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCard icon="📦" value="6 Types" label="Asset Categories" />
          <StatCard icon="💾" value="Shelby" label="Decentralized Storage" />
          <StatCard icon="🔗" value="Aptos" label="Blockchain" />
          <StatCard icon="🎮" value="Demo" label="Space Defender" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Platform Features
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Everything you need to build, store, and manage decentralized game
              assets on the Shelby network.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon="📦"
              title="Game Asset Manager"
              description="Upload sprites, backgrounds, audio, maps, configs, and save files. All stored on Shelby's decentralized network with Aptos wallet ownership."
            />
            <FeatureCard
              icon="🔐"
              title="Wallet Integration"
              description="Connect your Aptos wallet (Petra, Pontem) to sign transactions. Uses the Manual Registration Flow — your private key never leaves your wallet."
            />
            <FeatureCard
              icon="🖼️"
              title="Asset Gallery"
              description="Browse, preview, and share your game assets. Each asset gets a unique Shelby blob URL accessible from anywhere."
            />
            <FeatureCard
              icon="⚡"
              title="Shelby Protocol"
              description="Built on Shelby — the decentralized storage network on Aptos. Two-step upload: on-chain registration + off-chain data upload via RPC."
            />
            <FeatureCard
              icon="🤖"
              title="AI Dev Assistant"
              description="Get AI-powered help building games on Shelby. Ask about SDK integration, blob storage, wallet flows, and Aptos smart contracts."
            />
            <FeatureCard
              icon="🎮"
              title="Space Defender Demo"
              description="A showcase game that stores high scores as blobs on Shelby. See how decentralized storage works in a real game context."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gray-950/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Powered by Shelby Protocol&apos;s Manual Registration Flow for
              browser-safe wallet integration.
            </p>
          </div>

          <div className="space-y-8">
            <StepCard
              number={1}
              title="Connect Your Aptos Wallet"
              description="Link your Petra or Pontem wallet. ShelbyGameVault never accesses your private key — it uses signAndSubmitTransaction for all on-chain operations."
            />
            <StepCard
              number={2}
              title="Fund with ShelbyUSD"
              description="On testnet, your account is automatically funded with ShelbyUSD storage credits. On mainnet, you'll need to purchase credits to pay for storage."
            />
            <StepCard
              number={3}
              title="Upload & Store Assets"
              description="Upload game assets (sprites, maps, audio) to Shelby's decentralized storage. Each file goes through the Manual Registration Flow: commitments → wallet signature → RPC upload."
            />
            <StepCard
              number={4}
              title="Access Anywhere"
              description="Your files are stored on the Shelby network and accessible via public blob URLs. Share game assets with your team or load them directly in your game client."
            />
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Tech Stack
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900/60 rounded-xl border border-purple-500/20 p-6">
              <h3 className="text-lg font-bold text-purple-400 mb-3">
                Frontend
              </h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>⚡ Next.js 14 (React + TypeScript)</li>
                <li>🎨 Tailwind CSS</li>
                <li>🎮 HTML5 Canvas game engine</li>
                <li>🔗 Aptos Wallet Adapter</li>
              </ul>
            </div>
            <div className="bg-gray-900/60 rounded-xl border border-cyan-500/20 p-6">
              <h3 className="text-lg font-bold text-cyan-400 mb-3">
                Blockchain & Storage
              </h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>🔷 Aptos Blockchain (Testnet)</li>
                <li>💾 Shelby Protocol (Decentralized Storage)</li>
                <li>📡 Shelby RPC + Indexer API</li>
                <li>🔐 @shelby-protocol/sdk</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-purple-500/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Build?
          </h2>
          <p className="text-gray-400 mb-8">
            Start uploading your game assets to Shelby&apos;s decentralized storage.
            Build your asset library, explore the gallery, and see decentralized
            storage in action.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/assets"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg hover:opacity-90 transition-opacity"
            >
              📦 Start Uploading
            </Link>
            <Link
              href="/gallery"
              className="px-8 py-3.5 rounded-xl border border-gray-600 text-gray-300 font-bold text-lg hover:bg-gray-800 transition-colors"
            >
              🖼️ Browse Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
              S
            </div>
            <span className="text-sm text-gray-400">
              ShelbyGameVault — Built on Shelby Protocol × Aptos
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <a
              href="https://docs.shelby.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-400 transition-colors"
            >
              Shelby Docs
            </a>
            <a
              href="https://explorer.shelby.xyz/testnet"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-400 transition-colors"
            >
              Explorer
            </a>
            <a
              href="https://aptoslabs.com/testnet-faucet"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-400 transition-colors"
            >
              Aptos Faucet
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

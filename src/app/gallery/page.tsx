"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import AssetGallery from "@/components/AssetGallery";
import { useWallet } from "@/hooks/useWallet";
import { type GameAsset, getStoredAssets } from "@/lib/shelby";
import { ASSET_CATEGORIES, type AssetCategory } from "@/lib/constants";
import { marketplaceClient } from "@/lib/marketplaceClient";

export default function GalleryPage() {
  const { address } = useWallet();
  const [assets, setAssets] = useState<GameAsset[]>([]);
  const [filter, setFilter] = useState<AssetCategory | "all">("all");

  useEffect(() => {
    if (address) {
      setAssets(getStoredAssets(address));
    }
  }, [address]);

  const filteredAssets =
    filter === "all"
      ? assets
      : assets.filter((a) => a.category === filter);

  const hasRealSigner = marketplaceClient.hasRealSigner();

  return (
    <div className="min-h-screen bg-[#050510]">
      <Navbar />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              🖼️ Asset Gallery
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto">
              Browse all your game assets stored on Shelby&apos;s decentralized
              network. Filter by category and preview your files.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              All ({assets.length})
            </button>
            {ASSET_CATEGORIES.map((cat) => {
              const count = assets.filter((a) => a.category === cat).length;
              const icons: Record<string, string> = {
                sprites: "🎨",
                backgrounds: "🌄",
                audio: "🔊",
                maps: "🗺️",
                configs: "⚙️",
                saves: "💾",
              };
              return (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === cat
                      ? "bg-purple-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
                  }`}
                >
                  {icons[cat]}{" "}
                  {cat.charAt(0).toUpperCase() + cat.slice(1)} ({count})
                </button>
              );
            })}
          </div>

          {/* Gallery */}
          {!address ? (
            <div className="bg-gray-900/60 rounded-xl border border-purple-500/20 p-8 text-center">
              <div className="text-5xl mb-4">🔐</div>
              <h3 className="text-lg font-bold text-white mb-2">
                Connect Wallet
              </h3>
              <p className="text-gray-400 text-sm">
                Connect your Aptos wallet to browse your stored game assets.
              </p>
            </div>
          ) : (
            <AssetGallery assets={filteredAssets} isRealUpload={hasRealSigner} />
          )}

          {/* Shelby URLs */}
          {address && assets.length > 0 && (
            <div className="mt-8 bg-gray-900/40 rounded-xl border border-gray-800 p-6">
              <h3 className="text-sm font-bold text-gray-300 mb-3">
                🔗 Shelby Blob URLs
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Each asset is accessible via a public URL on the Shelby network.
                Share these links to let others access your game assets.
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2"
                  >
                    <span className="text-xs text-gray-400 truncate flex-1 mr-2">
                      {asset.originalName}
                    </span>
                    <code className="text-[10px] text-purple-400 font-mono truncate max-w-xs">
                      {asset.url}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

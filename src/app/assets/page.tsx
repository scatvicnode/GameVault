"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import FileUploader from "@/components/FileUploader";
import AssetGallery from "@/components/AssetGallery";
import { useWallet } from "@/hooks/useWallet";
import {
  type GameAsset,
  getStoredAssets,
  removeAssetRecord,
} from "@/lib/shelby";
import { marketplaceClient } from "@/lib/marketplaceClient";

export default function AssetsPage() {
  const { connected, address, connect } = useWallet();
  const [assets, setAssets] = useState<GameAsset[]>([]);

  useEffect(() => {
    if (address) {
      setAssets(getStoredAssets(address));
    }
  }, [address]);

  const handleUploadComplete = useCallback(
    (asset: GameAsset) => {
      setAssets((prev) => [...prev, asset]);
    },
    []
  );

  const handleDelete = useCallback(
    (assetId: string) => {
      if (!address) return;
      removeAssetRecord(address, assetId);
      setAssets((prev) => prev.filter((a) => a.id !== assetId));
    },
    [address]
  );

  const signAndSubmit = marketplaceClient.getSignAndSubmit();

  return (
    <div className="min-h-screen bg-[#050510]">
      <Navbar />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              📦 Game Asset Manager
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto">
              Upload and manage your game assets on Shelby&apos;s decentralized
              storage. Sprites, backgrounds, audio, maps, configs, and save
              files — all stored on-chain.
            </p>
          </div>

          {!connected ? (
            <div className="max-w-md mx-auto text-center">
              <div className="bg-gray-900/60 rounded-xl border border-purple-500/20 p-8">
                <div className="text-5xl mb-4">🔐</div>
                <h2 className="text-xl font-bold text-white mb-3">
                  Connect Wallet to Continue
                </h2>
                <p className="text-gray-400 text-sm mb-6">
                  You need to connect your Aptos wallet to upload and manage
                  game assets. Your wallet address is used as ownership proof on
                  the Shelby network.
                </p>
                <button
                  onClick={connect}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold hover:opacity-90 transition-opacity"
                >
                  Connect Wallet
                </button>
              </div>

              {/* How it works */}
              <div className="mt-8 bg-gray-900/40 rounded-xl border border-gray-800 p-6 text-left">
                <h3 className="text-sm font-bold text-gray-300 mb-3">
                  📋 How Asset Upload Works
                </h3>
                <ol className="text-xs text-gray-500 space-y-2 list-decimal list-inside">
                  <li>
                    <strong className="text-gray-400">Validate</strong> — File
                    size and type are checked client-side
                  </li>
                  <li>
                    <strong className="text-gray-400">Commitments</strong> —
                    Merkle commitments are generated in-browser via erasure
                    coding
                  </li>
                  <li>
                    <strong className="text-gray-400">Sign</strong> — Your
                    wallet signs the on-chain registration transaction (Aptos)
                  </li>
                  <li>
                    <strong className="text-gray-400">Upload</strong> — Raw data
                    chunks are sent to Shelby RPC nodes
                  </li>
                  <li>
                    <strong className="text-gray-400">Access</strong> — File is
                    available at a public Shelby blob URL
                  </li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Upload Section */}
              <FileUploader
                walletAddress={address!}
                signAndSubmit={signAndSubmit}
                onUploadComplete={handleUploadComplete}
              />

              {/* Assets Section */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  🗂️ Your Assets
                  <span className="text-sm font-normal text-gray-500">
                    ({assets.length} files)
                  </span>
                </h2>
                <AssetGallery
                  assets={assets}
                  onDelete={handleDelete}
                  isRealUpload={signAndSubmit !== null}
                />
              </div>

              {/* Shelby Info */}
              <div className="bg-gray-900/40 rounded-xl border border-gray-800 p-6">
                <h3 className="text-sm font-bold text-gray-300 mb-2">
                  ℹ️ About Shelby Storage
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Files are stored on Shelby&apos;s decentralized storage
                  network, which uses the Aptos blockchain for on-chain
                  registration and a network of RPC nodes for off-chain data.
                  Each blob has a 30-day expiration by default. On testnet, storage
                  credits (ShelbyUSD) are free. Blobs are publicly readable at{" "}
                  <code className="text-purple-400">
                    https://api.testnet.shelby.xyz/shelby/v1/blobs/
                    &lt;ADDRESS&gt;/&lt;FILENAME&gt;
                  </code>
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

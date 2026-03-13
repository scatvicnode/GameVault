"use client";

import { useState, useCallback } from "react";
import {
  type GameAsset,
  type SignAndSubmitFn,
  uploadToShelby,
  type UploadStatus,
} from "@/lib/shelby";
import {
  type AssetCategory,
  ASSET_CATEGORIES,
  SUPPORTED_ASSET_TYPES,
  formatFileSize,
  validateFileSize,
} from "@/lib/constants";

interface FileUploaderProps {
  walletAddress: string;
  /** Wallet signer — null for demo wallets (upload will be simulated) */
  signAndSubmit: SignAndSubmitFn | null;
  onUploadComplete: (asset: GameAsset) => void;
}

export default function FileUploader({
  walletAddress,
  signAndSubmit,
  onUploadComplete,
}: FileUploaderProps) {
  const [category, setCategory] = useState<AssetCategory>("sprites");
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = useCallback(
    async (file: File) => {
      setError(null);

      const validation = validateFileSize(file.size);
      if (!validation.valid) {
        setError(validation.error!);
        return;
      }

      // Use the full Manual Registration Flow from shelby.ts
      // (Developer Guide § 3 + § 4 — funding, commitments, sign, upload)
      const result = await uploadToShelby(
        walletAddress,
        file,
        category,
        signAndSubmit,
        (s) => setStatus(s)
      );

      if (result.success && result.asset) {
        onUploadComplete(result.asset);
        setTimeout(() => setStatus("idle"), 2000);
      } else {
        setStatus("error");
        setError(result.error || "Upload failed");
      }
    },
    [walletAddress, category, signAndSubmit, onUploadComplete]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  const statusLabels: Record<UploadStatus, string> = {
    idle: "",
    validating: "🔍 Validating file...",
    funding: "💰 Checking ShelbyUSD balance...",
    "generating-commitments": "🔐 Generating Merkle commitments...",
    "awaiting-signature": "✍️ Requesting wallet signature...",
    uploading: "📡 Uploading to Shelby RPC...",
    complete: "✅ Upload complete!",
    error: "❌ Upload failed",
  };

  const acceptedExtensions = SUPPORTED_ASSET_TYPES[category].join(",");

  return (
    <div className="bg-gray-900/60 rounded-xl border border-purple-500/20 p-6">
      <h3 className="text-lg font-bold text-white mb-4">
        📤 Upload Game Asset
      </h3>

      {/* Category selector */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">
          Asset Category
        </label>
        <div className="flex flex-wrap gap-2">
          {ASSET_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                category === cat
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              {cat === "sprites" && "🎨 "}
              {cat === "backgrounds" && "🌄 "}
              {cat === "audio" && "🔊 "}
              {cat === "maps" && "🗺️ "}
              {cat === "configs" && "⚙️ "}
              {cat === "saves" && "💾 "}
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragOver
            ? "border-purple-400 bg-purple-500/10"
            : "border-gray-700 hover:border-gray-600"
        }`}
      >
        <div className="text-4xl mb-3">
          {status === "uploading"
            ? "📡"
            : status === "complete"
              ? "✅"
              : "📁"}
        </div>

        {status === "idle" || status === "error" ? (
          <>
            <p className="text-gray-300 mb-2">
              Drag & drop your {category} file here
            </p>
            <p className="text-gray-500 text-sm mb-4">
              or click to browse · Max {formatFileSize(10 * 1024 * 1024)}
            </p>
            <label className="inline-block px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium cursor-pointer hover:bg-purple-500 transition-colors">
              Browse Files
              <input
                type="file"
                accept={acceptedExtensions}
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </>
        ) : (
          <div className="space-y-2">
            <p className="text-white font-medium">{statusLabels[status]}</p>
            {status !== "complete" && (
              <div className="w-48 mx-auto h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full animate-pulse w-3/4" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Info box */}
      {signAndSubmit === null && (
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-xs text-yellow-300">
            ⚠️ <strong>Demo Mode</strong> — No Aptos wallet detected. Uploads
            are simulated locally. Install{" "}
            <a
              href="https://petra.app"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-yellow-200"
            >
              Petra Wallet
            </a>{" "}
            for real on-chain uploads.
          </p>
        </div>
      )}
      <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
        <p className="text-xs text-gray-500">
          📋 <strong>Upload Flow:</strong> Validate → Fund ShelbyUSD → Generate
          Merkle Commitments → Sign with Wallet → Upload to Shelby RPC.
        </p>
      </div>
    </div>
  );
}

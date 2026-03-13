"use client";

import { type GameAsset } from "@/lib/shelby";
import { formatFileSize } from "@/lib/constants";

interface AssetGalleryProps {
  assets: GameAsset[];
  onDelete?: (assetId: string) => void;
  /** When true, blob URLs are real (uploaded via Petra wallet) */
  isRealUpload?: boolean;
}

const categoryIcons: Record<string, string> = {
  sprites: "🎨",
  backgrounds: "🌄",
  audio: "🔊",
  maps: "🗺️",
  configs: "⚙️",
  saves: "💾",
};

export default function AssetGallery({
  assets,
  onDelete,
  isRealUpload = false,
}: AssetGalleryProps) {
  if (assets.length === 0) {
    return (
      <div className="bg-gray-900/60 rounded-xl border border-purple-500/20 p-8 text-center">
        <div className="text-5xl mb-4">📦</div>
        <h3 className="text-lg font-bold text-white mb-2">No Assets Yet</h3>
        <p className="text-gray-400 text-sm">
          Upload your first game asset to get started! Your files will be stored
          on Shelby&apos;s decentralized storage network.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {assets.map((asset) => (
        <div
          key={asset.id}
          className="bg-gray-900/60 rounded-xl border border-purple-500/20 p-4 hover:border-purple-500/40 transition-colors group"
        >
          {/* Thumbnail area */}
          <div className="w-full h-32 bg-gray-800 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
            {asset.mimeType.startsWith("image/") ? (
              <div className="text-6xl">
                {categoryIcons[asset.category] || "📄"}
              </div>
            ) : (
              <div className="text-center">
                <div className="text-4xl mb-1">
                  {categoryIcons[asset.category] || "📄"}
                </div>
                <span className="text-xs text-gray-500 font-mono">
                  {asset.name.split(".").pop()?.toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-white truncate">
              {asset.originalName}
            </h4>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{formatFileSize(asset.size)}</span>
              <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] uppercase font-medium">
                {asset.category}
              </span>
            </div>
            <div className="text-xs text-gray-600 font-mono truncate">
              {asset.blobName}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            {isRealUpload ? (
              <a
                href={asset.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center px-2 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs hover:bg-cyan-500/20 transition-colors"
              >
                🔗 View on Shelby
              </a>
            ) : (
              <span
                title="Blob exists only locally in demo mode. Connect a real wallet to upload to Shelby."
                className="flex-1 text-center px-2 py-1.5 rounded-lg bg-gray-700/40 text-gray-500 text-xs cursor-default"
              >
                📋 Demo asset
              </span>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(asset.id)}
                className="px-2 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 transition-colors"
              >
                🗑️
              </button>
            )}
          </div>

          {/* Expiration */}
          <p className="text-[10px] text-gray-600 mt-2">
            Expires: {new Date(asset.expiresAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}

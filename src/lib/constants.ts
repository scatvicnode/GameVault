/**
 * Shelby Protocol constants and utilities for ShelbyGameVault.
 *
 * All endpoints and SDK references align with the Shelby Testnet Developer Guide:
 * {@link ../../../shelby_testnet_developer_guide.md}
 *
 * SDK imports (when installed):
 *   import { generateCommitments, createDefaultErasureCodingProvider,
 *            ShelbyBlobClient, ShelbyRPCClient } from "@shelby-protocol/sdk/browser";
 *   import { ShelbyClient } from "@shelby-protocol/sdk/browser";
 *   import { getShelbyIndexerClient } from "@shelby-protocol/sdk/browser";
 *   import { Network } from "@aptos-labs/ts-sdk";
 */

// ---------------------------------------------------------------------------
// Network endpoints (Developer Guide § 1 — Network Essentials)
// ---------------------------------------------------------------------------

/** Shelby testnet RPC endpoint */
export const SHELBY_RPC_ENDPOINT = "https://api.testnet.shelby.xyz/shelby";

/** Shelby testnet explorer URL */
export const SHELBY_EXPLORER_URL = "https://explorer.shelby.xyz/testnet";

/** Shelby blob access base URL (Developer Guide § 6) */
export const SHELBY_BLOB_BASE_URL =
  "https://api.testnet.shelby.xyz/shelby/v1/blobs";

/** Aptos testnet full-node URL */
export const APTOS_TESTNET_URL = "https://fullnode.testnet.aptoslabs.com/v1";

// ---------------------------------------------------------------------------
// Upload configuration (Developer Guide § 2 — Core Concepts)
// ---------------------------------------------------------------------------

/** Default blob expiration: 30 days in microseconds */
export const DEFAULT_EXPIRATION_DAYS = 30;

/** Clay encoding type for blobs (Developer Guide § 3 — encoding: 0) */
export const ENCODING_CLAY = 0;

/** Maximum file size for upload (10 MB) */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/** Default ShelbyUSD funding amount: 1 ShelbyUSD = 100_000_000 (Developer Guide § 4) */
export const DEFAULT_SHELBY_USD_AMOUNT = 100_000_000;

/** Game asset categories */
export const ASSET_CATEGORIES = [
  "sprites",
  "backgrounds",
  "audio",
  "maps",
  "configs",
  "saves",
] as const;

export type AssetCategory = (typeof ASSET_CATEGORIES)[number];

/** Supported asset file types */
export const SUPPORTED_ASSET_TYPES: Record<AssetCategory, string[]> = {
  sprites: [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"],
  backgrounds: [".png", ".jpg", ".jpeg", ".webp"],
  audio: [".mp3", ".wav", ".ogg"],
  maps: [".json", ".tmx", ".xml"],
  configs: [".json", ".yaml", ".yml", ".toml"],
  saves: [".json", ".bin", ".dat"],
};

/**
 * Returns the public blob URL for a given address and filename.
 */
export function getBlobUrl(address: string, filename: string): string {
  return `${SHELBY_BLOB_BASE_URL}/${encodeURIComponent(address)}/${encodeURIComponent(filename)}`;
}

/**
 * Calculates blob expiration timestamp in microseconds.
 */
export function calculateExpiration(
  days: number = DEFAULT_EXPIRATION_DAYS
): number {
  return Date.now() * 1000 + days * 24 * 60 * 60 * 1_000_000;
}

/**
 * Formats file size in human-readable form.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Validates that a file is within the allowed size limit.
 */
export function validateFileSize(
  size: number
): { valid: boolean; error?: string } {
  if (size <= 0) {
    return { valid: false, error: "File is empty." };
  }
  if (size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File exceeds maximum size of ${formatFileSize(MAX_FILE_SIZE_BYTES)}.`,
    };
  }
  return { valid: true };
}

/**
 * Sanitizes a filename to be safe for Shelby blob storage.
 */
export function sanitizeFilename(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  const hasDot = lastDot >= 0;
  const name = hasDot ? filename.slice(0, lastDot) : filename;
  const ext = hasDot ? filename.slice(lastDot) : "";

  const sanitized = name
    .replace(/[^a-zA-Z0-9_\-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 100);

  return `${sanitized || "file"}${ext}`;
}

/**
 * Detects asset category from file extension.
 */
export function detectAssetCategory(filename: string): AssetCategory | null {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  for (const [category, extensions] of Object.entries(SUPPORTED_ASSET_TYPES)) {
    if (extensions.includes(ext)) {
      return category as AssetCategory;
    }
  }
  return null;
}

/**
 * Generates a unique blob name with timestamp prefix.
 */
export function generateBlobName(
  category: AssetCategory,
  filename: string
): string {
  const ts = Date.now();
  const safe = sanitizeFilename(filename);
  return `game/${category}/${ts}_${safe}`;
}

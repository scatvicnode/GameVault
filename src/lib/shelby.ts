/**
 * Shelby Protocol integration using the official SDK.
 *
 * Implements the **Manual Registration Flow** from the Shelby Testnet Developer Guide
 * (shelby_testnet_developer_guide.md § 3) so users can upload game assets
 * directly from their browser wallet (Petra / Pontem).
 *
 * The 4-step flow:
 *   1. generateCommitments()          — Merkle roots via erasure coding
 *   2. ShelbyBlobClient.createRegisterBlobPayload() — build Aptos tx
 *   3. signAndSubmitTransaction()     — user signs in browser wallet
 *   4. rpcClient.putBlob()            — upload data to Shelby RPC
 *
 * @see shelby_testnet_developer_guide.md
 */

import {
  ENCODING_CLAY,
  DEFAULT_SHELBY_USD_AMOUNT,
  calculateExpiration,
  getBlobUrl,
  sanitizeFilename,
  validateFileSize,
  type AssetCategory,
  generateBlobName,
} from "./constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Represents a game asset stored in Shelby */
export interface GameAsset {
  id: string;
  name: string;
  originalName: string;
  blobName: string;
  category: AssetCategory;
  size: number;
  owner: string;
  url: string;
  createdAt: string;
  expiresAt: string;
  mimeType: string;
}

/**
 * Upload status tracking — mirrors the Manual Registration Flow steps.
 *
 * idle → validating → funding → generating-commitments
 *      → awaiting-signature → uploading → complete
 */
export type UploadStatus =
  | "idle"
  | "validating"
  | "funding"
  | "generating-commitments"
  | "awaiting-signature"
  | "uploading"
  | "complete"
  | "error";

/** High score entry */
export interface HighScore {
  player: string;
  score: number;
  timestamp: string;
  game: string;
}

/** Wallet signer function type (matches Petra / Pontem API) */
export type SignAndSubmitFn = (payload: {
  data: unknown;
}) => Promise<{ hash: string }>;

// ---------------------------------------------------------------------------
// SDK helpers — lazy-loaded so they only run in the browser
// ---------------------------------------------------------------------------

async function getShelbySDK() {
  const sdk = await import("@shelby-protocol/sdk/browser");
  return sdk;
}

async function getAptosSDK() {
  const aptos = await import("@aptos-labs/ts-sdk");
  return aptos;
}

// ---------------------------------------------------------------------------
// File helpers
// ---------------------------------------------------------------------------

/**
 * Reads a File into a Uint8Array.
 */
export async function fileToUint8Array(file: File): Promise<Uint8Array> {
  const buf = await file.arrayBuffer();
  return new Uint8Array(buf);
}

// ---------------------------------------------------------------------------
// Prepare file for upload
// ---------------------------------------------------------------------------

export async function prepareAssetForUpload(
  file: File,
  category: AssetCategory
): Promise<
  | { filename: string; blobName: string; data: Uint8Array }
  | { error: string }
> {
  const validation = validateFileSize(file.size);
  if (!validation.valid) {
    return { error: validation.error! };
  }

  const filename = sanitizeFilename(file.name);
  const blobName = generateBlobName(category, filename);
  const data = await fileToUint8Array(file);

  return { filename, blobName, data };
}

// ---------------------------------------------------------------------------
// Funding — ShelbyUSD storage credits (Developer Guide § 4)
// ---------------------------------------------------------------------------

/**
 * Funds an account with ShelbyUSD testnet storage credits.
 *
 * **Must be called before the blob registration transaction**, otherwise the
 * on-chain tx will revert with "insufficient storage credits".
 *
 * @see shelby_testnet_developer_guide.md § 4
 */
export async function fundAccountWithShelbyUSD(
  address: string,
  amount: number = DEFAULT_SHELBY_USD_AMOUNT
): Promise<{ funded: boolean; txHash?: string }> {
  try {
    const { ShelbyClient } = await getShelbySDK();
    const { Network } = await getAptosSDK();

    const client = new ShelbyClient({
      network: Network.TESTNET,
      apiKey: process.env.NEXT_PUBLIC_SHELBY_API_KEY,
    });

    const hash = await client.fundAccountWithShelbyUSD({ address, amount });
    return { funded: true, txHash: hash };
  } catch (err) {
    console.warn("[shelby] fundAccountWithShelbyUSD failed:", err);
    // On testnet, funding may fail if faucet is down. Allow upload to proceed.
    return { funded: false };
  }
}

// ---------------------------------------------------------------------------
// Fetching blobs — ShelbyIndexerClient (Developer Guide § 5)
// ---------------------------------------------------------------------------

/** Blob metadata returned by the indexer */
export interface ShelbyBlob {
  name: string;
  size: number;
  createdAt: string;
  expiresAt: string;
  url: string;
}

/**
 * Fetches all blobs owned by an Aptos address from the Shelby indexer.
 *
 * @see shelby_testnet_developer_guide.md § 5
 */
export async function fetchAccountBlobs(
  address: string
): Promise<ShelbyBlob[]> {
  try {
    const { getShelbyIndexerClient } = await getShelbySDK();
    const { Network } = await getAptosSDK();

    const indexer = getShelbyIndexerClient({
      network: Network.TESTNET,
      apiKey: process.env.NEXT_PUBLIC_SHELBY_API_KEY,
    });
    const result = await indexer.getBlobs({
      where: { owner: { _eq: address } },
    });
    const blobs = result?.blobs ?? [];
    return blobs.map(
      (b) => ({
        name: b.blob_name,
        size: Number(b.num_chunksets), // size in chunksets from indexer
        createdAt: b.created_at,
        expiresAt: b.expires_at,
        url: getBlobUrl(address, b.blob_name),
      })
    );
  } catch (err) {
    console.warn("[shelby] fetchAccountBlobs failed, using local storage:", err);
    // Fallback to local records
    const assets = getStoredAssets(address);
    return assets.map((a) => ({
      name: a.blobName,
      size: a.size,
      createdAt: a.createdAt,
      expiresAt: a.expiresAt,
      url: a.url,
    }));
  }
}

// ---------------------------------------------------------------------------
// Full upload flow (Developer Guide § 3 — all 4 steps combined)
// ---------------------------------------------------------------------------

/**
 * Uploads a game asset to Shelby following the Manual Registration Flow.
 *
 * When a real wallet signer is provided, this makes actual SDK calls:
 *   1. Fund account with ShelbyUSD (§ 4)
 *   2. Generate Merkle commitments (§ 3, step 1)
 *   3. Build registration payload & sign with wallet (§ 3, steps 2–3)
 *   4. Upload data to Shelby RPC (§ 3, step 4)
 *
 * When `signAndSubmit` is null (demo wallet), the upload is simulated locally.
 *
 * @param onStatus — callback to report progress to the UI
 */
export async function uploadToShelby(
  account: string,
  file: File,
  category: AssetCategory,
  signAndSubmit: SignAndSubmitFn | null,
  onStatus?: (status: UploadStatus) => void
): Promise<{ success: boolean; asset?: GameAsset; error?: string }> {
  const report = (s: UploadStatus) => onStatus?.(s);

  try {
    // — Validate —
    report("validating");
    const prepared = await prepareAssetForUpload(file, category);
    if ("error" in prepared) {
      return { success: false, error: prepared.error };
    }

    // — Is this a real upload or demo? —
    const isRealUpload = signAndSubmit !== null;

    if (isRealUpload) {
      // ==================================================================
      // REAL UPLOAD — using @shelby-protocol/sdk + wallet signer
      // ==================================================================

      const {
        createDefaultErasureCodingProvider,
        generateCommitments,
        ShelbyBlobClient,
        ShelbyRPCClient,
      } = await getShelbySDK();
      const { Network, Aptos, AptosConfig, AccountAddress } =
        await getAptosSDK();

      // — Step 0: Fund ShelbyUSD (Developer Guide § 4) —
      report("funding");
      await fundAccountWithShelbyUSD(account);

      // — Step 1: Generate Merkle commitments (Developer Guide § 3, step 1) —
      report("generating-commitments");
      const provider = await createDefaultErasureCodingProvider();
      const commitments = await generateCommitments(provider, prepared.data);

      // — Step 2: Build registration payload (Developer Guide § 3, step 2) —
      const payload = ShelbyBlobClient.createRegisterBlobPayload({
        account: AccountAddress.from(account),
        blobName: prepared.blobName,
        blobSize: prepared.data.length,
        blobMerkleRoot: commitments.blob_merkle_root,
        expirationMicros: calculateExpiration(30),
        numChunksets: commitments.chunkset_commitments.length,
        encoding: ENCODING_CLAY,
      });

      // — Step 3: Sign with wallet (Developer Guide § 3, step 3) —
      report("awaiting-signature");
      const txResponse = await signAndSubmit({ data: payload });

      // Wait for the transaction to be confirmed on-chain
      const aptosConfig = new AptosConfig({ network: Network.TESTNET });
      const aptosClient = new Aptos(aptosConfig);
      await aptosClient.waitForTransaction({
        transactionHash: txResponse.hash,
      });

      // — Step 4: Upload data to Shelby RPC (Developer Guide § 3, step 4) —
      report("uploading");
      const rpcClient = new ShelbyRPCClient({
        network: Network.TESTNET,
        apiKey: process.env.NEXT_PUBLIC_SHELBY_API_KEY,
      });

      await rpcClient.putBlob({
        account: AccountAddress.from(account),
        blobName: prepared.blobName,
        blobData: prepared.data,
      });
    } else {
      // ==================================================================
      // DEMO MODE — simulated upload (no real wallet)
      // ==================================================================
      report("funding");
      await new Promise((resolve) => setTimeout(resolve, 300));

      report("generating-commitments");
      await new Promise((resolve) => setTimeout(resolve, 400));

      report("awaiting-signature");
      await new Promise((resolve) => setTimeout(resolve, 300));

      report("uploading");
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    // — Build asset record —
    const asset: GameAsset = {
      id: `asset_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: prepared.filename,
      originalName: file.name,
      blobName: prepared.blobName,
      category,
      size: file.size,
      owner: account,
      url: getBlobUrl(account, prepared.blobName),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      mimeType: file.type || "application/octet-stream",
    };

    saveAssetRecord(account, asset);
    report("complete");
    return { success: true, asset };
  } catch (err: unknown) {
    report("error");
    const message =
      err instanceof Error ? err.message : "Upload failed";
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Local storage helpers (testnet demo — will be replaced by Shelby indexer)
// ---------------------------------------------------------------------------

const ASSETS_KEY_PREFIX = "shelby_game_assets_";
const SCORES_KEY = "shelby_game_scores";

/**
 * Fetches all game assets for an account from local storage.
 * In production, use {@link fetchAccountBlobs} (ShelbyIndexerClient).
 */
export function getStoredAssets(account: string): GameAsset[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(`${ASSETS_KEY_PREFIX}${account}`);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as GameAsset[];
  } catch {
    return [];
  }
}

/**
 * Saves a game asset record to local storage.
 */
export function saveAssetRecord(account: string, asset: GameAsset): void {
  if (typeof window === "undefined") return;
  const existing = getStoredAssets(account);
  existing.push(asset);
  localStorage.setItem(
    `${ASSETS_KEY_PREFIX}${account}`,
    JSON.stringify(existing)
  );
}

/**
 * Removes a game asset record from local storage.
 */
export function removeAssetRecord(account: string, assetId: string): void {
  if (typeof window === "undefined") return;
  const existing = getStoredAssets(account);
  const filtered = existing.filter((a) => a.id !== assetId);
  localStorage.setItem(
    `${ASSETS_KEY_PREFIX}${account}`,
    JSON.stringify(filtered)
  );
}

/**
 * Gets all high scores from local storage.
 */
export function getHighScores(game: string): HighScore[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(SCORES_KEY);
  if (!stored) return [];
  try {
    const all = JSON.parse(stored) as HighScore[];
    return all
      .filter((s) => s.game === game)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  } catch {
    return [];
  }
}

/**
 * Saves a high score to local storage.
 */
export function saveHighScore(entry: HighScore): void {
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem(SCORES_KEY);
  let all: HighScore[] = [];
  try {
    all = stored ? JSON.parse(stored) : [];
  } catch {
    all = [];
  }
  all.push(entry);
  localStorage.setItem(SCORES_KEY, JSON.stringify(all));
}

/**
 * @deprecated Use {@link uploadToShelby} instead — it follows the full
 * Manual Registration Flow from the developer guide.
 */
export async function simulateUpload(
  account: string,
  file: File,
  category: AssetCategory
): Promise<{ success: boolean; asset?: GameAsset; error?: string }> {
  return uploadToShelby(account, file, category, null);
}

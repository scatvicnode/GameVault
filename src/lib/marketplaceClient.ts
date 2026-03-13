/**
 * Singleton client managing Shelby SDK operations + wallet state.
 *
 * Components call `setWallet(address)` after connection and
 * `setSignAndSubmitTransaction(fn)` to wire up the signer.
 * Then `uploadAsset()` follows the full Manual Registration Flow (§ 3).
 */

import type { ShelbyAccount } from "@/types";
import type { ShelbyBlob, SignAndSubmitFn } from "@/lib/shelby";
import {
  fundAccountWithShelbyUSD,
  fetchAccountBlobs,
  uploadToShelby,
  type GameAsset,
  type UploadStatus,
  getStoredAssets,
  removeAssetRecord,
} from "@/lib/shelby";
import type { AssetCategory } from "@/lib/constants";

class MarketplaceClient {
  private address: string | null = null;
  private account: ShelbyAccount | null = null;
  private signAndSubmitFn: SignAndSubmitFn | null = null;

  /**
   * Stores the wallet signer from the Aptos wallet adapter.
   * Must be called after connection so uploads can sign transactions.
   */
  setSignAndSubmitTransaction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fn: (payload: any) => Promise<{ hash: string }>
  ): void {
    // Wrap to match our SignAndSubmitFn shape
    this.signAndSubmitFn = (payload: { data: unknown }) => fn(payload);
  }

  /**
   * Sets the active wallet address and fetches account info.
   * Called after the Aptos wallet adapter reports a successful connection.
   */
  async setWallet(address: string): Promise<void> {
    this.address = address;

    // Try to fetch real blobs from the Shelby indexer
    let blobs: ShelbyBlob[] = [];
    try {
      blobs = await fetchAccountBlobs(address);
    } catch {
      // Graceful fallback — indexer may be unreachable
    }

    this.account = {
      address,
      balance: 0, // Balance unknown without on-chain query
      blobs,
    };
  }

  /** Returns the current Shelby account state (or null before connection). */
  getAccount(): ShelbyAccount | null {
    return this.account;
  }

  /** Returns the current wallet address, if connected. */
  getAddress(): string | null {
    return this.address;
  }

  /** Returns the configured signer, if any. */
  getSignAndSubmit(): SignAndSubmitFn | null {
    return this.signAndSubmitFn;
  }

  /** Whether a real signer is available (not demo mode). */
  hasRealSigner(): boolean {
    return this.signAndSubmitFn !== null;
  }

  /**
   * Convenience: Upload a game asset using the configured signer.
   * Falls back to demo (simulated) upload when no signer is set.
   */
  async uploadAsset(
    file: File,
    category: AssetCategory,
    onStatus?: (status: UploadStatus) => void
  ): Promise<{ success: boolean; asset?: GameAsset; error?: string }> {
    if (!this.address) {
      return { success: false, error: "No wallet connected" };
    }

    return uploadToShelby(
      this.address,
      file,
      category,
      this.signAndSubmitFn,
      onStatus
    );
  }

  /** Get locally stored assets for the connected address. */
  getStoredAssets(): GameAsset[] {
    if (!this.address) return [];
    return getStoredAssets(this.address);
  }

  /** Remove an asset record by id. */
  removeAsset(assetId: string): void {
    if (!this.address) return;
    removeAssetRecord(this.address, assetId);
  }

  /** Fund account with ShelbyUSD (testnet). */
  async fundAccount(amount?: number): Promise<{ funded: boolean }> {
    if (!this.address) return { funded: false };
    return fundAccountWithShelbyUSD(this.address, amount);
  }

  /** Clear state on disconnect. */
  clear(): void {
    this.address = null;
    this.account = null;
    this.signAndSubmitFn = null;
  }
}

/** Singleton instance used across the app. */
export const marketplaceClient = new MarketplaceClient();

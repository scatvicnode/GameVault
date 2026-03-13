import type { ShelbyBlob } from "@/lib/shelby";

/**
 * Represents the Shelby account state for the connected wallet.
 *
 * Populated by {@link marketplaceClient.setWallet} after wallet connection.
 */
export interface ShelbyAccount {
  /** Aptos wallet address (hex string) */
  address: string;
  /** ShelbyUSD balance (in micro-units, 0 if unknown) */
  balance: number;
  /** Blobs owned by this address on the Shelby indexer */
  blobs: ShelbyBlob[];
}

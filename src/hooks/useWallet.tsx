"use client";

import { marketplaceClient } from "@/lib/marketplaceClient";
import type { ShelbyAccount } from "@/types";
import { Network } from "@aptos-labs/ts-sdk";
import {
  AptosWalletAdapterProvider,
  useWallet as useAptosWallet,
} from "@aptos-labs/wallet-adapter-react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface WalletContextType {
  connected: boolean;
  connecting: boolean;
  address: string | null;
  account: ShelbyAccount | null;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  refreshAccount: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wallets: readonly any[];
}

const WalletContext = createContext<WalletContextType | null>(null);

// ---------------------------------------------------------------------------
// Inner provider (uses the Aptos adapter hooks)
// ---------------------------------------------------------------------------

function WalletContextProvider({ children }: { children: ReactNode }) {
  const {
    connect: aptosConnect,
    disconnect: aptosDisconnect,
    account: aptosAccount,
    connected: aptosConnected,
    isLoading,
    wallets,
    signAndSubmitTransaction,
  } = useAptosWallet();

  const [account, setAccount] = useState<ShelbyAccount | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync adapter state → marketplaceClient + local state
  useEffect(() => {
    if (aptosConnected && aptosAccount?.address) {
      const addr = aptosAccount.address.toString();

      // Wire signing function into the marketplace client
      marketplaceClient.setSignAndSubmitTransaction(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async (payload: any) => {
          const result = await signAndSubmitTransaction(payload);
          return { hash: result.hash };
        }
      );

      marketplaceClient.setWallet(addr).then(() => {
        setAccount(marketplaceClient.getAccount());
        setError(null);
      });

      localStorage.setItem("shelbymarket_wallet", addr);
    } else {
      setAccount(null);
    }
  }, [aptosConnected, aptosAccount, signAndSubmitTransaction]);

  // -----------------------------------------------------------------------
  // connect — find an installed wallet and call aptosConnect
  // -----------------------------------------------------------------------
  const connect = useCallback(() => {
    setError(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const installed = wallets.filter((w: any) => w.readyState === "Installed");
    if (installed.length === 0) {
      setError("No Aptos wallet found. Please install an Aptos wallet like Petra.");
      window.open("https://petra.app/", "_blank");
      return;
    }
    try {
      aptosConnect(installed[0].name);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to connect wallet."
      );
    }
  }, [wallets, aptosConnect]);

  // -----------------------------------------------------------------------
  // disconnect
  // -----------------------------------------------------------------------
  const disconnect = useCallback(() => {
    try {
      aptosDisconnect();
    } catch {
      /* ignore */
    }
    marketplaceClient.clear();
    setAccount(null);
    setError(null);
    localStorage.removeItem("shelbymarket_wallet");
  }, [aptosDisconnect]);

  // -----------------------------------------------------------------------
  // refreshAccount
  // -----------------------------------------------------------------------
  const refreshAccount = useCallback(async () => {
    if (aptosAccount?.address) {
      await marketplaceClient.setWallet(aptosAccount.address.toString());
      setAccount(marketplaceClient.getAccount());
    }
  }, [aptosAccount]);

  return (
    <WalletContext.Provider
      value={{
        connected: aptosConnected,
        connecting: isLoading,
        address: aptosAccount?.address?.toString() ?? null,
        account,
        error,
        connect,
        disconnect,
        refreshAccount,
        wallets,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Public provider (wraps the app in both Aptos adapter + our context)
// ---------------------------------------------------------------------------

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <AptosWalletAdapterProvider
      autoConnect={false}
      dappConfig={{ network: Network.TESTNET }}
    >
      <WalletContextProvider>{children}</WalletContextProvider>
    </AptosWalletAdapterProvider>
  );
}

// ---------------------------------------------------------------------------
// Public hook
// ---------------------------------------------------------------------------

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}

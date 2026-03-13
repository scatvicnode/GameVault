"use client";

import { WalletProvider } from "@/hooks/useWallet";
import type { ReactNode } from "react";

/**
 * Client component that wraps children with the WalletProvider.
 * Used in the root layout (which is a server component) to provide
 * wallet context to the entire app.
 */
export function WalletProviderWrapper({ children }: { children: ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>;
}

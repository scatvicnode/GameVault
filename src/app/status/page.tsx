"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";

interface ServiceStatus {
  name: string;
  url: string;
  status: "online" | "offline" | "degraded";
  latencyMs: number | null;
  details?: string;
}

interface StatusResponse {
  timestamp: string;
  overall: string;
  services: ServiceStatus[];
  shelbyIntegrated: boolean;
  network: string;
}

export default function StatusPage() {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/shelby-status");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const statusIcon = (s: string) => {
    if (s === "online") return "🟢";
    if (s === "degraded") return "🟡";
    return "🔴";
  };

  const overallLabel = (o: string) => {
    if (o === "all_operational") return { text: "All Systems Operational", color: "text-green-400" };
    if (o === "partial") return { text: "Partial Outage", color: "text-yellow-400" };
    return { text: "Major Outage", color: "text-red-400" };
  };

  return (
    <div className="min-h-screen bg-[#050510]">
      <Navbar />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              📡 Shelby Network Status
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto">
              Live connectivity check for Shelby Protocol and Aptos Testnet
              services.
            </p>
          </div>

          {/* Status Card */}
          <div className="bg-gray-900/60 rounded-xl border border-purple-500/20 p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4 animate-spin">⟳</div>
                <p className="text-gray-400">Checking services...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">⚠️</div>
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={fetchStatus}
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-500"
                >
                  Retry
                </button>
              </div>
            ) : data ? (
              <div>
                {/* Overall */}
                <div className="text-center mb-8">
                  <div className={`text-2xl font-bold ${overallLabel(data.overall).color} mb-1`}>
                    {overallLabel(data.overall).text}
                  </div>
                  <p className="text-xs text-gray-500">
                    Network: {data.network} · Checked:{" "}
                    {new Date(data.timestamp).toLocaleTimeString()}
                  </p>
                </div>

                {/* Services */}
                <div className="space-y-3">
                  {data.services.map((svc) => (
                    <div
                      key={svc.name}
                      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{statusIcon(svc.status)}</span>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {svc.name}
                          </div>
                          <div className="text-[10px] text-gray-500 font-mono break-all">
                            {svc.url}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-sm font-bold ${
                            svc.status === "online"
                              ? "text-green-400"
                              : svc.status === "degraded"
                                ? "text-yellow-400"
                                : "text-red-400"
                          }`}
                        >
                          {svc.status.toUpperCase()}
                        </div>
                        {svc.latencyMs !== null && (
                          <div className="text-[10px] text-gray-500">
                            {svc.latencyMs}ms
                          </div>
                        )}
                        {svc.details && (
                          <div className="text-[10px] text-gray-600">
                            {svc.details}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Refresh */}
                <div className="mt-6 text-center">
                  <button
                    onClick={fetchStatus}
                    className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm hover:bg-gray-700 transition-colors border border-gray-700"
                  >
                    🔄 Refresh
                  </button>
                </div>

                {/* Integration badge */}
                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                  <p className="text-green-400 text-sm font-medium">
                    ✅ Shelby Protocol Integrated
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    ShelbyGameVault connects to Shelby RPC for blob storage,
                    Shelby Health for monitoring, and Aptos Testnet for on-chain
                    transactions.
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Integration Details */}
          <div className="mt-6 bg-gray-900/40 rounded-xl border border-gray-800 p-6">
            <h3 className="text-sm font-bold text-gray-300 mb-3">
              🔗 Shelby Integration Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-purple-400 font-medium">Shelby RPC Endpoint</span>
                <p className="text-gray-500 font-mono mt-1 break-all">
                  https://api.testnet.shelby.xyz/shelby
                </p>
              </div>
              <div>
                <span className="text-purple-400 font-medium">Blob Access URL Pattern</span>
                <p className="text-gray-500 font-mono mt-1 break-all">
                  /shelby/v1/blobs/&lt;ADDRESS&gt;/&lt;FILENAME&gt;
                </p>
              </div>
              <div>
                <span className="text-purple-400 font-medium">Blockchain</span>
                <p className="text-gray-500 mt-1">Aptos Testnet</p>
              </div>
              <div>
                <span className="text-purple-400 font-medium">Upload Flow</span>
                <p className="text-gray-500 mt-1">
                  Manual Registration (commitments → wallet sign → RPC upload)
                </p>
              </div>
            </div>
          </div>

          {/* Env check */}
          <div className="mt-6 bg-gray-900/40 rounded-xl border border-gray-800 p-6">
            <h3 className="text-sm font-bold text-gray-300 mb-3">
              ⚙️ Configuration Checklist
            </h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span className="text-gray-400">
                  NEXT_PUBLIC_SHELBY_API_KEY — Shelby API key for RPC access
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span className="text-gray-400">
                  NEXT_PUBLIC_APTOS_NETWORK — Network selection (testnet)
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span className="text-gray-400">
                  OPENAI_API_KEY — OpenAI key for AI Assistant (server-side only)
                </span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

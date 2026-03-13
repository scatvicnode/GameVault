import { NextResponse } from "next/server";

const SHELBY_RPC = "https://api.testnet.shelby.xyz/shelby";
const SHELBY_HEALTH = "https://api.testnet.shelby.xyz/shelby/v1/health";
const APTOS_NODE = "https://fullnode.testnet.aptoslabs.com/v1";

interface ServiceStatus {
  name: string;
  url: string;
  status: "online" | "offline" | "degraded";
  latencyMs: number | null;
  details?: string;
}

async function checkService(
  name: string,
  url: string
): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeout);

    const latencyMs = Date.now() - start;
    const isOk = res.status >= 200 && res.status < 400;

    return {
      name,
      url,
      status: isOk ? "online" : "degraded",
      latencyMs,
      details: `HTTP ${res.status}`,
    };
  } catch (err: unknown) {
    const latencyMs = Date.now() - start;
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      name,
      url,
      status: "offline",
      latencyMs: latencyMs > 7500 ? null : latencyMs,
      details: message,
    };
  }
}

export async function GET() {
  const [shelbyRpc, shelbyHealth, aptosNode] = await Promise.all([
    checkService("Shelby RPC", SHELBY_RPC),
    checkService("Shelby Health", SHELBY_HEALTH),
    checkService("Aptos Testnet", APTOS_NODE),
  ]);

  const services = [shelbyRpc, shelbyHealth, aptosNode];
  const onlineCount = services.filter((s) => s.status === "online").length;
  const overall =
    onlineCount === services.length
      ? "all_operational"
      : onlineCount > 0
        ? "partial"
        : "outage";

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    overall,
    services,
    shelbyIntegrated: true,
    network: "testnet",
  });
}

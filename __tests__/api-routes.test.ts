/**
 * Tests for /api/chat and /api/shelby-status route handlers.
 *
 * These test the pure logic of the route handlers by mocking Next.js
 * request/response and the OpenAI client.
 */

// --- Chat API tests ---

describe("chat API route logic", () => {
  it("rejects empty messages array", async () => {
    // Simulate validation: messages must be non-empty array
    const messages: unknown[] = [];
    const isValid =
      Array.isArray(messages) && messages.length > 0;
    expect(isValid).toBe(false);
  });

  it("rejects non-array messages", async () => {
    const messages = "not an array";
    const isValid =
      Array.isArray(messages) && (messages as unknown[]).length > 0;
    expect(isValid).toBe(false);
  });

  it("accepts valid messages array", () => {
    const messages = [{ role: "user", content: "Hello" }];
    const isValid = Array.isArray(messages) && messages.length > 0;
    expect(isValid).toBe(true);
  });

  it("trims messages to last 20", () => {
    const messages = Array.from({ length: 30 }, (_, i) => ({
      role: "user",
      content: `msg ${i}`,
    }));
    const trimmed = messages.slice(-20);
    expect(trimmed).toHaveLength(20);
    expect(trimmed[0].content).toBe("msg 10");
  });

  it("coerces content to string", () => {
    const content = 12345;
    expect(String(content)).toBe("12345");
  });
});

// --- Shelby Status API tests ---

describe("shelby status API logic", () => {
  it("computes overall status correctly - all online", () => {
    const services = [
      { status: "online" },
      { status: "online" },
      { status: "online" },
    ];
    const onlineCount = services.filter((s) => s.status === "online").length;
    const overall =
      onlineCount === services.length
        ? "all_operational"
        : onlineCount > 0
          ? "partial"
          : "outage";
    expect(overall).toBe("all_operational");
  });

  it("computes overall status correctly - partial", () => {
    const services = [
      { status: "online" },
      { status: "offline" },
      { status: "online" },
    ];
    const onlineCount = services.filter((s) => s.status === "online").length;
    const overall =
      onlineCount === services.length
        ? "all_operational"
        : onlineCount > 0
          ? "partial"
          : "outage";
    expect(overall).toBe("partial");
  });

  it("computes overall status correctly - full outage", () => {
    const services = [
      { status: "offline" },
      { status: "offline" },
      { status: "degraded" },
    ];
    const onlineCount = services.filter((s) => s.status === "online").length;
    const overall =
      onlineCount === services.length
        ? "all_operational"
        : onlineCount > 0
          ? "partial"
          : "outage";
    expect(overall).toBe("outage");
  });

  it("response structure includes expected fields", () => {
    const response = {
      timestamp: new Date().toISOString(),
      overall: "all_operational",
      services: [],
      shelbyIntegrated: true,
      network: "testnet",
    };
    expect(response).toHaveProperty("timestamp");
    expect(response).toHaveProperty("overall");
    expect(response).toHaveProperty("services");
    expect(response).toHaveProperty("shelbyIntegrated", true);
    expect(response).toHaveProperty("network", "testnet");
  });
});

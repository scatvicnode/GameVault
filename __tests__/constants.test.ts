import {
  formatFileSize,
  validateFileSize,
  sanitizeFilename,
  getBlobUrl,
  calculateExpiration,
  detectAssetCategory,
  generateBlobName,
  MAX_FILE_SIZE_BYTES,
  DEFAULT_SHELBY_USD_AMOUNT,
  SHELBY_RPC_ENDPOINT,
  SHELBY_BLOB_BASE_URL,
  APTOS_TESTNET_URL,
} from "@/lib/constants";

describe("constants", () => {
  describe("formatFileSize", () => {
    it("formats 0 bytes", () => {
      expect(formatFileSize(0)).toBe("0 B");
    });

    it("formats bytes", () => {
      expect(formatFileSize(500)).toBe("500 B");
    });

    it("formats kilobytes", () => {
      expect(formatFileSize(1024)).toBe("1.0 KB");
    });

    it("formats megabytes", () => {
      expect(formatFileSize(1024 * 1024 * 5)).toBe("5.0 MB");
    });
  });

  describe("validateFileSize", () => {
    it("rejects empty files", () => {
      const result = validateFileSize(0);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("empty");
    });

    it("rejects oversized files", () => {
      const result = validateFileSize(MAX_FILE_SIZE_BYTES + 1);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("exceeds");
    });

    it("accepts valid files", () => {
      const result = validateFileSize(1024);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe("sanitizeFilename", () => {
    it("keeps safe filenames", () => {
      expect(sanitizeFilename("player_sprite.png")).toBe("player_sprite.png");
    });

    it("replaces special characters", () => {
      expect(sanitizeFilename("my file (1).png")).toBe("my_file_1.png");
    });

    it("handles files without extension", () => {
      expect(sanitizeFilename("README")).toBe("README");
    });

    it("truncates long filenames", () => {
      const longName = "a".repeat(200) + ".png";
      const result = sanitizeFilename(longName);
      expect(result.length).toBeLessThanOrEqual(104); // 100 chars + .png
    });

    it("returns fallback for empty name", () => {
      expect(sanitizeFilename(".png")).toBe("file.png");
    });
  });

  describe("getBlobUrl", () => {
    it("constructs correct URL", () => {
      const url = getBlobUrl("0xabc123", "my_file.txt");
      expect(url).toBe(
        "https://api.testnet.shelby.xyz/shelby/v1/blobs/0xabc123/my_file.txt"
      );
    });

    it("encodes special characters in filename", () => {
      const url = getBlobUrl("0xabc", "game/sprites/test.png");
      expect(url).toContain("game%2Fsprites%2Ftest.png");
    });
  });

  describe("calculateExpiration", () => {
    it("returns a future timestamp in microseconds", () => {
      const now = Date.now() * 1000;
      const expiration = calculateExpiration(30);
      expect(expiration).toBeGreaterThan(now);
    });

    it("defaults to 30 days", () => {
      const nowMicro = Date.now() * 1000;
      const thirtyDaysMicro = 30 * 24 * 60 * 60 * 1_000_000;
      const expiration = calculateExpiration();
      // Allow 1 second tolerance
      expect(expiration).toBeGreaterThan(nowMicro + thirtyDaysMicro - 1_000_000);
      expect(expiration).toBeLessThan(nowMicro + thirtyDaysMicro + 1_000_000);
    });
  });

  describe("detectAssetCategory", () => {
    it("detects sprite files", () => {
      expect(detectAssetCategory("player.png")).toBe("sprites");
      expect(detectAssetCategory("sprite.gif")).toBe("sprites");
    });

    it("detects audio files", () => {
      expect(detectAssetCategory("bgm.mp3")).toBe("audio");
      expect(detectAssetCategory("sfx.wav")).toBe("audio");
    });

    it("detects map files", () => {
      expect(detectAssetCategory("level1.tmx")).toBe("maps");
    });

    it("returns null for unknown types", () => {
      expect(detectAssetCategory("readme.txt")).toBeNull();
    });
  });

  describe("generateBlobName", () => {
    it("generates a prefixed blob name", () => {
      const name = generateBlobName("sprites", "hero.png");
      expect(name).toMatch(/^game\/sprites\/\d+_hero\.png$/);
    });

    it("sanitizes the filename part", () => {
      const name = generateBlobName("audio", "my song (1).mp3");
      expect(name).toMatch(/^game\/audio\/\d+_my_song_1\.mp3$/);
    });
  });

  describe("network constants (Developer Guide § 1)", () => {
    it("Shelby RPC endpoint matches guide", () => {
      expect(SHELBY_RPC_ENDPOINT).toBe("https://api.testnet.shelby.xyz/shelby");
    });

    it("blob base URL matches guide § 6", () => {
      expect(SHELBY_BLOB_BASE_URL).toBe("https://api.testnet.shelby.xyz/shelby/v1/blobs");
    });

    it("Aptos testnet URL is correct", () => {
      expect(APTOS_TESTNET_URL).toBe("https://fullnode.testnet.aptoslabs.com/v1");
    });

    it("ShelbyUSD default amount is 1 ShelbyUSD (Developer Guide § 4)", () => {
      expect(DEFAULT_SHELBY_USD_AMOUNT).toBe(100_000_000);
    });
  });
});

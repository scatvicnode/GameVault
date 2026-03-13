import {
  fundAccountWithShelbyUSD,
  fetchAccountBlobs,
  getStoredAssets,
  saveAssetRecord,
  removeAssetRecord,
  getHighScores,
  saveHighScore,
  type GameAsset,
  type HighScore,
} from "@/lib/shelby";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, val: string) => {
      store[key] = val;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("shelby", () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe("fundAccountWithShelbyUSD (Developer Guide § 4)", () => {
    it("returns funded result (falls back gracefully without SDK)", async () => {
      // Without the real SDK/network, fundAccountWithShelbyUSD catches the
      // import error and returns { funded: false }.
      const result = await fundAccountWithShelbyUSD("0xabc");
      expect(result).toHaveProperty("funded");
    });
  });

  describe("fetchAccountBlobs (Developer Guide § 5)", () => {
    it("returns empty when no assets stored", async () => {
      const blobs = await fetchAccountBlobs("0xabc");
      expect(blobs).toEqual([]);
    });

    it("returns stored assets as blobs", async () => {
      const asset: GameAsset = {
        id: "test_1",
        name: "hero.png",
        originalName: "hero.png",
        blobName: "game/sprites/123_hero.png",
        category: "sprites",
        size: 2048,
        owner: "0xabc",
        url: "https://api.testnet.shelby.xyz/shelby/v1/blobs/0xabc/game%2Fsprites%2F123_hero.png",
        createdAt: "2025-01-01T00:00:00Z",
        expiresAt: "2025-01-31T00:00:00Z",
        mimeType: "image/png",
      };
      saveAssetRecord("0xabc", asset);

      const blobs = await fetchAccountBlobs("0xabc");
      expect(blobs).toHaveLength(1);
      expect(blobs[0].name).toBe("game/sprites/123_hero.png");
      expect(blobs[0].size).toBe(2048);
    });
  });

  describe("asset storage (localStorage)", () => {
    const testAsset: GameAsset = {
      id: "test_1",
      name: "hero.png",
      originalName: "hero.png",
      blobName: "game/sprites/123_hero.png",
      category: "sprites",
      size: 2048,
      owner: "0xabc",
      url: "https://api.testnet.shelby.xyz/shelby/v1/blobs/0xabc/game/sprites/123_hero.png",
      createdAt: "2025-01-01T00:00:00Z",
      expiresAt: "2025-01-31T00:00:00Z",
      mimeType: "image/png",
    };

    it("returns empty array when no assets stored", () => {
      const assets = getStoredAssets("0xabc");
      expect(assets).toEqual([]);
    });

    it("saves and retrieves assets", () => {
      saveAssetRecord("0xabc", testAsset);
      const assets = getStoredAssets("0xabc");
      expect(assets).toHaveLength(1);
      expect(assets[0].id).toBe("test_1");
    });

    it("removes assets by id", () => {
      saveAssetRecord("0xabc", testAsset);
      saveAssetRecord("0xabc", { ...testAsset, id: "test_2", name: "bg.png" });

      removeAssetRecord("0xabc", "test_1");
      const assets = getStoredAssets("0xabc");
      expect(assets).toHaveLength(1);
      expect(assets[0].id).toBe("test_2");
    });
  });

  describe("high scores (localStorage)", () => {
    it("returns empty array when no scores", () => {
      const scores = getHighScores("space-defender");
      expect(scores).toEqual([]);
    });

    it("saves and retrieves high scores sorted by score desc", () => {
      const entry1: HighScore = {
        player: "0xabc",
        score: 100,
        timestamp: "2025-01-01T00:00:00Z",
        game: "space-defender",
      };
      const entry2: HighScore = {
        player: "0xdef",
        score: 500,
        timestamp: "2025-01-02T00:00:00Z",
        game: "space-defender",
      };

      saveHighScore(entry1);
      saveHighScore(entry2);

      const scores = getHighScores("space-defender");
      expect(scores).toHaveLength(2);
      expect(scores[0].score).toBe(500);
      expect(scores[1].score).toBe(100);
    });

    it("filters by game name", () => {
      saveHighScore({
        player: "0x1",
        score: 100,
        timestamp: "2025-01-01T00:00:00Z",
        game: "space-defender",
      });
      saveHighScore({
        player: "0x2",
        score: 200,
        timestamp: "2025-01-01T00:00:00Z",
        game: "other-game",
      });

      const scores = getHighScores("space-defender");
      expect(scores).toHaveLength(1);
      expect(scores[0].player).toBe("0x1");
    });

    it("limits to top 10 scores", () => {
      for (let i = 0; i < 15; i++) {
        saveHighScore({
          player: `0x${i}`,
          score: i * 100,
          timestamp: "2025-01-01T00:00:00Z",
          game: "space-defender",
        });
      }

      const scores = getHighScores("space-defender");
      expect(scores).toHaveLength(10);
      expect(scores[0].score).toBe(1400); // highest
    });
  });
});

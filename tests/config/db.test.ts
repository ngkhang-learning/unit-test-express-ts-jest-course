jest.mock("mongodb", () => {
  return {
    MongoClient: jest.fn(() => ({
      connect: jest.fn().mockResolvedValue(undefined),
      db: jest.fn(() => ({
        collection: jest.fn(() => ({ users: "users" })),
      })),
      close: jest.fn(),
    })),
  };
});

describe("Database config", () => {
  const URI_TEST =
    "mongodb+srv://username:password@cluster0-ngkhang.mongodb.net/database_name";

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe("Connect Database", () => {
    it("should call once time", async () => {
      const { connectMongo } = await import("~/config/db");
      const { MongoClient } = await import("mongodb");

      await connectMongo(URI_TEST);
      await connectMongo(URI_TEST);

      expect(MongoClient).toHaveBeenCalledTimes(1);
    });

    it("should log when connect database success", async () => {
      const { connectMongo } = await import("~/config/db");
      const { logger } = await import("~/config/logger");

      const mockLoggerInfoFn = jest.spyOn(logger, "info");
      await connectMongo(URI_TEST);

      expect(mockLoggerInfoFn).toHaveBeenCalledTimes(1);
      expect(mockLoggerInfoFn).toHaveBeenCalledWith("Connected to MongoDB");
    });
  });

  describe("getDb() function", () => {
    it("should db when connected database", async () => {
      const { getDb, connectMongo } = await import("~/config/db");

      await connectMongo(URI_TEST);

      expect(() => getDb()).not.toThrow("MongoDB not initialized");
    });

    it("should throw error when don't connect database", async () => {
      const { getDb } = await import("~/config/db");

      expect(() => getDb()).toThrow("MongoDB not initialized");
    });
  });

  describe("Get collection from Database", () => {
    it("should return users collection", async () => {
      const { col, connectMongo } = await import("~/config/db");

      await connectMongo(URI_TEST);

      const usersCollection = col.users();

      expect(usersCollection).toBeDefined();
    });

    it("should return users collection", async () => {
      const { col, getDb, connectMongo } = await import("~/config/db");
      const mockFailCollection = () => getDb().collection("test-collection");

      await connectMongo(URI_TEST);

      expect(col).not.toEqual(mockFailCollection);
    });
  });
});

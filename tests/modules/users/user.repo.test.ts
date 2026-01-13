import { ObjectId } from "mongodb";

import { col } from "~/config/db";
import { UserRepo } from "~/modules/users/user.repo";
import { UserRole, type User } from "~/modules/users/user.types";
import { objectIdToString } from "~/utils/objectIdToString";

jest.mock("~/config/db", () => ({
  col: {
    users: jest.fn(),
  }
}));

jest.mock("~/utils/objectIdToString", () => ({
  objectIdToString: jest.fn()
}));

describe("UserRepo", () => {
  const mockObjectID = "507f1f77bcf86cd799439011";
  const mockUserData: User = {
    _id: new ObjectId(mockObjectID),
    email: 'ngkhang@gmail.com',
    username: 'ngkhang',
    password_hash: 'hashed-password-@1234',
    role: UserRole.GUEST,
    createdAt: new Date('2026-01-08T20:41:32.571Z'),
    updatedAt: new Date('2026-01-08T20:41:32.571Z')
  };

  let findOne: jest.Mock;
  let find: jest.Mock;
  let toArray: jest.Mock;
  let insertOne: jest.Mock;

  beforeEach(() => {
    findOne = jest.fn();
    find = jest.fn();
    toArray = jest.fn();
    insertOne = jest.fn();

    (col.users as jest.Mock).mockReturnValue({
      findOne,
      find,
      insertOne,
    });
  })

  describe("findById()", () => {
    it("should query with ObjectId and return user data", async () => {
      findOne.mockResolvedValue(mockUserData);

      const result = await UserRepo.findById(mockObjectID);

      expect(col.users).toHaveBeenCalled();
      expect(findOne).toHaveBeenCalledWith({ _id: new ObjectId(mockObjectID) });
      expect(findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUserData);
    });

    it("should convert string ID to ObjectId", async () => {
      findOne.mockResolvedValue(mockUserData);

      await UserRepo.findById(mockObjectID);

      const callArg = findOne.mock.calls[0][0];
      expect(callArg._id).toBeInstanceOf(ObjectId);
      expect(callArg._id.toHexString()).toBe(mockObjectID);
    });

    it("should return null when user not found", async () => {
      findOne.mockResolvedValue(null);

      const result = await UserRepo.findById("507f1f77bcf86cd7994390aa");

      expect(result).toBeNull();
    });

    it("should handle invalid ObjectId format", async () => {
      const invalidId = "invalid-id";

      await expect(UserRepo.findById(invalidId)).rejects.toThrow();
    });
  });

  describe("findByEmail()", () => {
    it("should query by email and return user data", async () => {
      findOne.mockResolvedValue(mockUserData);

      const result = await UserRepo.findByEmail(mockUserData.email);

      expect(col.users).toHaveBeenCalled();
      expect(findOne).toHaveBeenCalledWith({ email: mockUserData.email });
      expect(findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUserData);
    });

    it("should return null when email not found", async () => {
      findOne.mockResolvedValue(null);

      const result = await UserRepo.findByEmail("nonexistent@email.com");

      expect(result).toBeNull();
    });

    it("should be case-sensitive for email", async () => {
      findOne.mockResolvedValue(null);

      await UserRepo.findByEmail("NGKHANG@GMAIL.COM");

      expect(findOne).toHaveBeenCalledWith({ email: "NGKHANG@GMAIL.COM" });
    });
  });

  describe("create()", () => {
    it("should add timestamps before insertion", async () => {
      jest.useFakeTimers();
      const fixedDate = new Date('2026-01-08T20:41:32.571Z');
      jest.setSystemTime(fixedDate);

      const insertedId = new ObjectId();
      insertOne.mockResolvedValue({ insertedId });
      (objectIdToString as jest.Mock).mockReturnValue("fake-user-id");

      const { _id, createdAt, updatedAt, ...createPayload } = mockUserData;

      await UserRepo.create(createPayload);

      const insertedDoc = insertOne.mock.calls[0][0];

      expect(insertedDoc).toHaveProperty('createdAt');
      expect(insertedDoc).toHaveProperty('updatedAt');
      expect(insertedDoc.createdAt).toEqual(fixedDate);
      expect(insertedDoc.updatedAt).toEqual(fixedDate);
      expect(insertedDoc.createdAt.getTime()).toBe(insertedDoc.updatedAt.getTime());

      jest.useRealTimers();
    });

    it("should insert document and convert _id to string", async () => {
      const insertedId = new ObjectId();
      insertOne.mockResolvedValue({ insertedId });
      (objectIdToString as jest.Mock).mockReturnValue("string-id-123");

      const { _id, ...createPayload } = mockUserData;

      const result = await UserRepo.create(createPayload);

      expect(insertOne).toHaveBeenCalledTimes(1);
      expect(objectIdToString).toHaveBeenCalledWith(insertedId);
      expect(result._id).toBe("string-id-123");
    });

    it("should return complete user object with string _id", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-01-08T20:41:32.571Z'));

      const insertedId = new ObjectId();
      insertOne.mockResolvedValue({ insertedId });
      (objectIdToString as jest.Mock).mockReturnValue("converted-id");

      const { _id, ...createPayload } = mockUserData;

      const result = await UserRepo.create(createPayload);

      expect(result).toMatchObject({
        ...createPayload,
        _id: "converted-id",
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      jest.useRealTimers();
    });

    it("should preserve all user properties", async () => {
      const insertedId = new ObjectId();
      insertOne.mockResolvedValue({ insertedId });
      (objectIdToString as jest.Mock).mockReturnValue("id");

      const { _id, ...createPayload } = mockUserData;

      const result = await UserRepo.create(createPayload);

      expect(result.email).toBe(createPayload.email);
      expect(result.username).toBe(createPayload.username);
      expect(result.password_hash).toBe(createPayload.password_hash);
      expect(result.role).toBe(createPayload.role);
    });
  });

  describe("list()", () => {
    it("should call find and toArray", async () => {
      find.mockReturnValue({ toArray });
      toArray.mockResolvedValue([mockUserData]);

      await UserRepo.list();

      expect(col.users).toHaveBeenCalled();
      expect(find).toHaveBeenCalledWith();
      expect(find).toHaveBeenCalledTimes(1);
      expect(toArray).toHaveBeenCalledTimes(1);
    });

    it("should return array of users", async () => {
      const users = [
        { ...mockUserData, _id: new ObjectId() },
        { ...mockUserData, _id: new ObjectId(), email: 'user2@test.com' }
      ];

      find.mockReturnValue({ toArray });
      toArray.mockResolvedValue(users);

      const result = await UserRepo.list();

      expect(result).toEqual(users);
      expect(result).toHaveLength(2);
    });

    it("should return empty array when no users", async () => {
      find.mockReturnValue({ toArray });
      toArray.mockResolvedValue([]);

      const result = await UserRepo.list();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should handle database errors", async () => {
      const error = new Error('Database query failed');
      find.mockReturnValue({ toArray });
      toArray.mockRejectedValue(error);

      await expect(UserRepo.list()).rejects.toThrow('Database query failed');
    });
  })
})

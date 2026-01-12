import { ObjectId } from "mongodb";

import { col } from "~/config/db";
import { UserRepo } from "~/modules/users/user.repo";
import { UserRole, type User } from "~/modules/users/user.types";
import { objectIdToString } from "~/utils/objectIdToString";

const mockObjectID = "507f1f77bcf86cd799439011";

const mockUserData: User = {
  _id: new ObjectId(mockObjectID),
  email: 'ngkhang@gmail.com',
  username: 'ngkhang',
  password_hash: 'hashed-password-@1234',
  role: UserRole.GUEST,
  createdAt: new Date(),
}

jest.mock("~/config/db", () => ({
  col: {
    users: jest.fn(),
  }
}))

jest.mock("~/utils/objectIdToString", () => ({
  objectIdToString: jest.fn()
}
))

describe("UserRepo", () => {

  const findOne = jest.fn();
  const find = jest.fn();
  const toArray = jest.fn();
  const insertOne = jest.fn();

  beforeEach(() => {
    ; (col.users as jest.Mock).mockReturnValue({
      findOne,
      find,
      insertOne,
    })
  })

  describe("findById() function", () => {
    it("should return data with valid ID", async () => {
      findOne.mockResolvedValue(mockUserData);

      const result = await UserRepo.findById(mockObjectID);

      expect(col.users).toHaveBeenCalled();
      expect(findOne).toHaveBeenCalledTimes(1);
      expect(findOne).toHaveBeenCalledWith({ _id: new ObjectId(mockObjectID) });

      expect(findOne.mock.calls[0][0]).toEqual({ _id: new ObjectId(mockObjectID) });
      expect(result).toBe(mockUserData);
    })

    it("should return null with invalid ID", () => { })
  })

  describe("findByEmail() function", () => {
    it("should return data with valid email", async () => {
      findOne.mockResolvedValue(mockUserData);

      const result = await UserRepo.findByEmail(mockUserData.email);

      expect(col.users).toHaveBeenCalled();
      expect(findOne).toHaveBeenCalledTimes(1);
      expect(findOne).toHaveBeenCalledWith({ email: mockUserData.email });

      expect(result).toBe(mockUserData);
    })
  })

  describe("create() function", () => {
    it("should add timestamp, insert and return _id as string", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-01-08T20:41:32.571Z'));

      const insertedId = new ObjectId();
      insertOne.mockResolvedValue({ insertedId });

      ; (objectIdToString as jest.Mock).mockReturnValue("fake-user-id");
      const { _id, ...createUserPayload } = mockUserData;

      const result = await UserRepo.create(createUserPayload);

      expect(col.users).toHaveBeenCalled();
      expect(insertOne).toHaveBeenCalledTimes(1);
      const insertedDoc = insertOne.mock.calls[0][0];

      expect(insertedDoc).toMatchObject({
        ...createUserPayload,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })

      expect(insertedDoc.createdAt.getTime()).toBe(insertedDoc.updatedAt.getTime());

      expect(objectIdToString).toHaveBeenCalledWith(insertedId);
      expect(result).toMatchObject({
        ...insertedDoc,
        _id: "fake-user-id"
      })

      jest.useRealTimers();
    })
  })

  describe("list() function", () => {
    it("should return list user", async () => {
      find.mockReturnValue({ toArray });
      toArray.mockResolvedValue(mockUserData);

      const result = await UserRepo.list();

      expect(col.users).toHaveBeenCalled();
      expect(find).toHaveBeenCalledTimes(1);
      expect(toArray).toHaveBeenCalledTimes(1);

      expect(result).toBe(mockUserData)
    })
  })

})

import bcryptjs from 'bcryptjs';
import { StatusCodes } from "http-status-codes";

import { ApiError } from '~/core/http/ApiError';
import { UserRepo } from "~/modules/users/user.repo";
import { UserService } from "~/modules/users/user.service";
import { UserRole } from '~/modules/users/user.types';

jest.mock("~/modules/users/user.repo", () => ({
  UserRepo: {
    findByEmail: jest.fn(),
    create: jest.fn(),
    list: jest.fn(),
    findById: jest.fn(),
  }
}))

jest.mock("bcryptjs", () => ({
  hash: jest.fn()
}))

describe("UserService", () => {
  const validUserData = {
    email: "ngkhang@gmail.com",
    username: "ngkhang",
    password: "khang@12345"
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("register()", () => {
    describe("Error cases", () => {
      it("should throw 409 Conflict when email already exists", async () => {
        const existingUser = {
          _id: "existing-user-id",
          email: validUserData.email,
          username: "existinguser",
          password_hash: "hashed",
          role: UserRole.USER
        };

        (UserRepo.findByEmail as jest.Mock).mockResolvedValue(existingUser);

        await expect(
          UserService.register(validUserData.email, validUserData.username, validUserData.password)
        ).rejects.toMatchObject({
          statusCode: StatusCodes.CONFLICT,
          message: 'Email already exists'
        });

        expect(UserRepo.findByEmail).toHaveBeenCalledWith(validUserData.email);
        expect(UserRepo.findByEmail).toHaveBeenCalledTimes(1);
        expect(bcryptjs.hash).not.toHaveBeenCalled();
        expect(UserRepo.create).not.toHaveBeenCalled();
      });

      it("should throw ApiError instance", async () => {
        (UserRepo.findByEmail as jest.Mock).mockResolvedValue({ email: validUserData.email });

        await expect(
          UserService.register(validUserData.email, validUserData.username, validUserData.password)
        ).rejects.toBeInstanceOf(ApiError);
      });
    })

    describe("Success cases", () => {
      beforeEach(() => {
        (UserRepo.findByEmail as jest.Mock).mockResolvedValue(null);
      });

      it("should hash password with bcrypt", async () => {
        const hashedPassword = "hashed-password-123";
        (bcryptjs.hash as jest.Mock).mockResolvedValue(hashedPassword);

        const mockCreatedUser = {
          _id: "new-user-id",
          email: validUserData.email,
          username: validUserData.username,
          password_hash: hashedPassword,
          role: UserRole.USER
        };

        (UserRepo.create as jest.Mock).mockResolvedValue(mockCreatedUser);

        await UserService.register(validUserData.email, validUserData.username, validUserData.password);

        expect(bcryptjs.hash).toHaveBeenCalledWith(validUserData.password, 10);
        expect(bcryptjs.hash).toHaveBeenCalledTimes(1);
      });

      it("should create user with hashed password and USER role", async () => {
        const hashedPassword = "hashed-password-123";
        (bcryptjs.hash as jest.Mock).mockResolvedValue(hashedPassword);

        const mockCreatedUser = {
          _id: "new-user-id",
          email: validUserData.email,
          username: validUserData.username,
          password_hash: hashedPassword,
          role: UserRole.USER
        };

        (UserRepo.create as jest.Mock).mockResolvedValue(mockCreatedUser);

        await UserService.register(validUserData.email, validUserData.username, validUserData.password);

        expect(UserRepo.create).toHaveBeenCalledWith({
          email: validUserData.email,
          username: validUserData.username,
          password_hash: hashedPassword,
          role: UserRole.USER
        });
        expect(UserRepo.create).toHaveBeenCalledTimes(1);
      });

      it("should return created user data", async () => {
        const hashedPassword = "hashed-password-123";
        (bcryptjs.hash as jest.Mock).mockResolvedValue(hashedPassword);

        const mockCreatedUser = {
          _id: "new-user-id",
          email: validUserData.email,
          username: validUserData.username,
          password_hash: hashedPassword,
          role: UserRole.USER,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        (UserRepo.create as jest.Mock).mockResolvedValue(mockCreatedUser);

        const result = await UserService.register(
          validUserData.email,
          validUserData.username,
          validUserData.password
        );

        expect(result).toEqual(mockCreatedUser);
        expect(result).toHaveProperty('_id');
        expect(result).toHaveProperty('email', validUserData.email);
        expect(result).toHaveProperty('username', validUserData.username);
        expect(result).toHaveProperty('role', UserRole.USER);
      });
    })
  })

  describe("list()", () => {
    it("should call UserRepo.list without parameters", async () => {
      const fakeUsers = [
        {
          _id: "user-id-01",
          email: "user01@gmail.com",
          username: "user01",
          password_hash: "hash1",
          role: UserRole.USER
        },
        {
          _id: "user-id-02",
          email: "user02@gmail.com",
          username: "user02",
          password_hash: "hash2",
          role: UserRole.USER
        }
      ];

      (UserRepo.list as jest.Mock).mockResolvedValue(fakeUsers);

      await UserService.list();

      expect(UserRepo.list).toHaveBeenCalled();
      expect(UserRepo.list).toHaveBeenCalledTimes(1);
    });

    it("should return list of users from repository", async () => {
      const fakeUsers = [
        {
          _id: "user-id-01",
          email: "user01@gmail.com",
          username: "user01",
          password_hash: "hash1",
          role: UserRole.USER
        }
      ];

      (UserRepo.list as jest.Mock).mockResolvedValue(fakeUsers);

      const result = await UserService.list();

      expect(result).toEqual(fakeUsers);
      expect(result).toHaveLength(1);
    });

    it("should return empty array when no users", async () => {
      (UserRepo.list as jest.Mock).mockResolvedValue([]);

      const result = await UserService.list();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should propagate repository errors", async () => {
      const error = new Error('Database connection failed');
      (UserRepo.list as jest.Mock).mockRejectedValue(error);

      await expect(UserService.list()).rejects.toThrow('Database connection failed');
    });
  })
})

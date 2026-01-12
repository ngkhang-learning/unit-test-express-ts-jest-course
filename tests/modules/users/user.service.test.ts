// describe("", ()=>{
//   it("", ()=> {})
// })
import bcryptjs from 'bcryptjs';
import { StatusCodes } from "http-status-codes";

import { UserRepo } from "~/modules/users/user.repo";
import { UserService } from "~/modules/users/user.service";
import { UserRole } from '~/modules/users/user.types';

const mockUserData = {
  _id: "fake-user-id-01",
  email: "ngkhang@gmail.com",
  username: "ngkhang",
  password: "khang@12345"
}

jest.mock("~/modules/users/user.repo", () => ({
  UserRepo: {
    findByEmail: jest.fn(),
    create: jest.fn(),
    list: jest.fn(),
    findById: jest.fn(),
  }
}))

jest.mock("bcryptjs", () => ({
  // bcryptjs: {
  hash: jest.fn()
  // }
}))

describe("UserService", () => {
  describe("register() function", () => {
    it("should throw error 409 (conflict) if user already exists", async () => {
      ; (UserRepo.findByEmail as jest.Mock).mockResolvedValue(mockUserData);

      const promise = UserService.register(mockUserData.email, mockUserData.username, mockUserData.password);

      await expect(promise).rejects.toMatchObject({
        statusCode: StatusCodes.CONFLICT,
        message: 'Email already exists'
      })
      expect(UserRepo.findByEmail).toHaveBeenCalledTimes(1);
      expect(UserRepo.findByEmail).toHaveBeenCalledWith(mockUserData.email);

      expect(bcryptjs.hash).not.toHaveBeenCalled();
      expect(UserRepo.create).not.toHaveBeenCalled();
    })

    it("should create user with role USER", async () => {
      ; (UserRepo.findByEmail as jest.Mock).mockResolvedValue(null);

      const mockHashedPassword = "hashed-password";
      ; (bcryptjs.hash as jest.Mock).mockResolvedValue(mockHashedPassword);

      const mockCreatedUserResponse = {
        _id: "fake-user-id-01",
        email: "ngkhang@gmail.com",
        username: "ngkhang",
        password: mockHashedPassword,
        role: UserRole.USER
      }
        ; (UserRepo.create as jest.Mock).mockResolvedValue(mockCreatedUserResponse);


      const result = await UserService.register(mockUserData.email, mockUserData.username, mockUserData.password);

      expect(UserRepo.findByEmail).toHaveBeenCalledWith(mockUserData.email);
      expect(bcryptjs.hash).toHaveBeenCalledWith(mockUserData.password, 10);

      expect(UserRepo.create).toHaveBeenCalledWith({
        email: mockCreatedUserResponse.email,
        username: mockCreatedUserResponse.username,
        password_hash: mockHashedPassword,
        role: UserRole.USER
      });

      expect(result).toBe(mockCreatedUserResponse);
    })
  })

  describe("list() function", () => {
    it("should return list of user", async () => {
      const fakeUsersResponse = [
        {
          _id: "fake-user-id-01",
          email: "user01@gmail.com",
          username: "user01",
        },
        {
          _id: "fake-user-id-02",
          email: "user02@gmail.com",
          username: "user02",
        }
      ]

        ; (UserRepo.list as jest.Mock).mockResolvedValue(fakeUsersResponse);
      const result = await UserService.list();

      expect(UserRepo.list).toHaveBeenCalled();
      expect(result).toBe(fakeUsersResponse);
    })
  })
})

import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { UserController } from '~/modules/users/user.controller';
import { UserService } from '~/modules/users/user.service';

jest.mock('~/modules/users/user.service', () => ({
  UserService: {
    register: jest.fn(),
    list: jest.fn(),
  }
}));

describe("UserController", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("register()", () => {
    const validUserData = {
      email: 'ngkhang@gmail.com',
      username: 'ngkhang',
      password: 'khang@123456'
    };

    it("should call UserService.register with correct parameters", async () => {
      mockReq.body = validUserData;

      const fakeUserResponse = {
        _id: 'fake-user-id',
        email: validUserData.email,
        username: validUserData.username
      };

      (UserService.register as jest.Mock).mockResolvedValue(fakeUserResponse);

      await UserController.register(mockReq as Request, mockRes as Response);

      expect(UserService.register).toHaveBeenCalledWith(
        validUserData.email,
        validUserData.username,
        validUserData.password
      );
      expect(UserService.register).toHaveBeenCalledTimes(1);
    });

    it("should return 201 with user data excluding password", async () => {
      mockReq.body = validUserData;

      const fakeUserResponse = {
        _id: 'fake-user-id',
        email: validUserData.email,
        username: validUserData.username,
        password_hash: 'hashed-password',
        role: 'user'
      };

      (UserService.register as jest.Mock).mockResolvedValue(fakeUserResponse);

      await UserController.register(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(mockRes.json).toHaveBeenCalledWith({
        _id: fakeUserResponse._id,
        email: fakeUserResponse.email,
        username: fakeUserResponse.username
      });
    });

    it("should not expose password_hash in response", async () => {
      mockReq.body = validUserData;

      const fakeUserResponse = {
        _id: 'fake-user-id',
        email: validUserData.email,
        username: validUserData.username,
        password_hash: 'hashed-password'
      };

      (UserService.register as jest.Mock).mockResolvedValue(fakeUserResponse);

      await UserController.register(mockReq as Request, mockRes as Response);

      const responseData = (mockRes.json as jest.Mock).mock.calls[0][0];
      expect(responseData).not.toHaveProperty('password_hash');
      expect(responseData).not.toHaveProperty('password');
    });

    it("should propagate service errors", async () => {
      mockReq.body = validUserData;

      const error = new Error('Service error');
      (UserService.register as jest.Mock).mockRejectedValue(error);

      await expect(
        UserController.register(mockReq as Request, mockRes as Response)
      ).rejects.toThrow('Service error');

      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe("list()", () => {
    it("should call UserService.list without parameters", async () => {
      const fakeUsersResponse = [
        {
          _id: 'fake-user-id-01',
          email: 'user01@gmail.com',
          username: 'user01'
        },
        {
          _id: 'fake-user-id-02',
          email: 'user02@gmail.com',
          username: 'user02'
        }
      ];

      (UserService.list as jest.Mock).mockResolvedValue(fakeUsersResponse);

      await UserController.list(mockReq as Request, mockRes as Response);

      expect(UserService.list).toHaveBeenCalledWith();
      expect(UserService.list).toHaveBeenCalledTimes(1);
    });

    it("should return 200 with list of users", async () => {
      const fakeUsersResponse = [
        {
          _id: 'fake-user-id-01',
          email: 'user01@gmail.com',
          username: 'user01'
        }
      ];

      (UserService.list as jest.Mock).mockResolvedValue(fakeUsersResponse);

      await UserController.list(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockRes.json).toHaveBeenCalledWith(fakeUsersResponse);
    });

    it("should return 200 with empty array when no users", async () => {
      (UserService.list as jest.Mock).mockResolvedValue([]);

      await UserController.list(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockRes.json).toHaveBeenCalledWith([]);
    });

    it("should propagate service errors", async () => {
      const error = new Error('Database error');
      (UserService.list as jest.Mock).mockRejectedValue(error);

      await expect(
        UserController.list(mockReq as Request, mockRes as Response)
      ).rejects.toThrow('Database error');
    });
  })
})

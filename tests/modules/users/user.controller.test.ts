import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { UserController } from '~/modules/users/user.controller'
import { UserService } from '~/modules/users/user.service'

jest.mock('~/modules/users/user.service', () => ({
  UserService: {
    register: jest.fn(),
    list: jest.fn(),
  }
}))

describe("UserController", () => {
  const mockRes = () => {
    const res = {} as unknown as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);

    return res;
  }

  describe("register() function", () => {
    it("should call userService.register and return 201 with user data", async () => {
      const req = {
        body: {
          email: 'ngkhang@gmail.com',
          username: 'ngkhang',
          password: 'khang@123456'
        }
      } as unknown as Request;

      const res = mockRes()

      const fakeUserRegisterRes = {
        _id: 'fake-user--id',
        email: 'ngkhang@gmail.com',
        username: 'khang@123456'
      };

      (UserService.register as jest.Mock).mockResolvedValue(fakeUserRegisterRes);

      await UserController.register(req, res);

      expect(UserService.register).toHaveBeenCalledWith(
        req.body.email,
        req.body.username,
        req.body.password,
      );
      expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(res.json).toHaveBeenCalledWith(fakeUserRegisterRes);
    })
  })


  describe("list() function", () => {
    it("should call userService.list and return 20 with list users data", async () => {
      const req = {} as unknown as Request;
      const res = mockRes();

      const fakeUsersRes = [{
        _id: 'fake-user-id-01',
        email: 'user01@gmail.com',
        username: 'user01@123456'
      }, {
        _id: 'fake-user-id-02',
        email: 'user02@gmail.com',
        username: 'user02@123456'
      }];

      (UserService.list as jest.Mock).mockResolvedValue(fakeUsersRes);

      await UserController.list(req, res);

      expect(UserService.list).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith(fakeUsersRes)
    })
  })
})

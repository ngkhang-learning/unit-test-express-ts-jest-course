import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { asyncHandler } from '~/core/asyncHandler';


describe("asyncHandler middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      query: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe("Error handling", () => {
    it("should pass error to next() when controller throws", async () => {
      const error = new Error("Controller error");
      const handlerFunc: RequestHandler = async () => {
        throw error;
      };

      const wrappedController = asyncHandler(handlerFunc);
      await wrappedController(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledTimes(1);
    })

    it("should handle string errors", async () => {
      const errorMessage = "Something went wrong";
      const handlerFunc: RequestHandler = async () => {
        throw errorMessage;
      };

      const wrappedController = asyncHandler(handlerFunc);
      await wrappedController(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(errorMessage);
    });

    it("should handle rejected promises", async () => {
      const error = new Error("Promise rejected");
      const handlerFunc: RequestHandler = async () => {
        return Promise.reject(error);
      };

      const wrappedController = asyncHandler(handlerFunc);
      await wrappedController(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  })

  describe("Successful execution", () => {
    it("should call the wrapped function with req, res, next", async () => {
      const handlerFunc = jest.fn().mockResolvedValue(undefined);

      await asyncHandler(handlerFunc)(mockReq as Request, mockRes as Response, mockNext);

      expect(handlerFunc).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(handlerFunc).toHaveBeenCalledTimes(1);
    });

    it("should not call next() when no error occurs", async () => {
      const handlerFunc: RequestHandler = async (_req, res) => {
        res.status(StatusCodes.OK).json({ message: "Success" });
      };

      await asyncHandler(handlerFunc)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Success" });
    });

    it("should allow controller to send response", async () => {
      const handlerFunc: RequestHandler = async (_req, res) => {
        res.json({ data: "test data" });
      };

      await asyncHandler(handlerFunc)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({ data: "test data" });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle void return from controller", async () => {
      const handlerFunc: RequestHandler = async (_req, res) => {
        res.status(StatusCodes.NO_CONTENT).send();
      };

      await asyncHandler(handlerFunc)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.NO_CONTENT);
      expect(mockNext).not.toHaveBeenCalled();
    });
  })
})

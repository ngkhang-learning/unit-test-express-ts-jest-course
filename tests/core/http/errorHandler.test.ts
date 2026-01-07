import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from "http-status-codes";


import { ApiError } from "~/core/http/ApiError";
import { errorHandler } from "~/core/http/errorHandler";

describe("errorHandler", () => {
  let mockReq: Request;
  let mockRes: Response;
  let mockNext: jest.MockedFunction<NextFunction>;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockReq = {} as unknown as Request;
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;
    mockNext = jest.fn();

    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  })

  describe("when handling ApiError", () => {
    it("should return ApiError with statusCode, message and details", () => {
      const mockDetails = { path: "email", message: "Invalid format" };
      const mockError = new ApiError(StatusCodes.BAD_REQUEST, "Something went wrong", mockDetails);

      const result = errorHandler(mockError, mockReq, mockRes, mockNext);

      expect(result.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(result.json).toHaveBeenCalledWith({
        message: "Something went wrong",
        details: mockDetails,
      });
    })

    it("should not log ApiError to console", () => {
      const error = ApiError.BadRequest("Invalid input");

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  })

  describe("when handling non-ApiError", () => {
    it("should return 500", () => {
      const mockError = new Error("Unexpected error");
      const result = errorHandler(mockError, mockReq, mockRes, mockNext
      );

      expect(result.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.json).toHaveBeenCalledWith({
        message: "Internal Server Error",
      });
    })

    it("should return 500 for string error", () => {
      const mockError = "Something went wrong";

      const result = errorHandler(mockError, mockReq, mockRes, mockNext
      );

      expect(result.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.json).toHaveBeenCalledWith({
        message: "Internal Server Error",
      });
    });
  })
})

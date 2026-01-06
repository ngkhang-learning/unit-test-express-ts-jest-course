import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from "http-status-codes";


import { ApiError } from "~/core/http/ApiError";
import { errorHandler } from "~/core/http/errorHandler";

describe("errorHandler", () => {
  it("should return custom api error", () => {
    const mockReq = {} as Request;
    const mockRes: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const mockNext = jest.fn() as unknown as NextFunction;

    const mockError = new ApiError(StatusCodes.BAD_REQUEST, "Somethings went wrong", {});

    // const result = errorHandler(mockError, mockReq as Request, mockRes as Response, mockNext);
    errorHandler(mockError, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "Somethings went wrong", details: {} });
  })


  it("should return error not handler", () => {
    const mockReq = {} as Request;
    const mockRes: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const mockNext = jest.fn() as unknown as NextFunction;

    const mockError = "Somethings went wrong";

    errorHandler(mockError, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
  })
})

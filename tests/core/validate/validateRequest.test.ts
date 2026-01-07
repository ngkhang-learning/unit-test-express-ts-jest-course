
import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import z from "zod";

import { ApiError } from '~/core/http/ApiError';
import { validateRequest, ZodEmptyObject } from "~/core/validate/validateRequest";

describe("validateRequest", () => {
  let mockReq: Request;
  let mockRes: Response;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockReq = {} as unknown as Request;
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;
    mockNext = jest.fn();

  })

  describe("when request is valid", () => {
    it("should call next() with valid body", () => {
      const schema = z.object({
        body: z.object({
          email: z.email(),
        }),
        query: ZodEmptyObject,
        params: ZodEmptyObject,
      })

      mockReq.body = { email: "khang@gmail.com" };
      validateRequest(schema)(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    })

    it("should call next() with valid query params", () => {
      const schema = z.object({
        body: ZodEmptyObject,
        query: z.object({
          page: z.coerce.number().int().min(1),
          limit: z.coerce.number().int().min(1).max(100),
        }),
        params: ZodEmptyObject,
      })

      mockReq.query = { page: "1", limit: "10" };
      validateRequest(schema)(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    })

    it("should call next() with valid URL params", () => {
      const schema = z.object({
        body: ZodEmptyObject,
        query: ZodEmptyObject,
        params: z.object({
          userId: z.string()
        }),
      })

      mockReq.params = { userId: "550e8400-e29b-41d4-a716-446655440000" };
      validateRequest(schema)(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    })

    it("should call next() with valid body, query and params", () => {
      const schema = z.object({
        body: z.object({
          name: z.string().min(1),
        }),
        query: z.object({
          sort: z.enum(["asc", "desc"]),
        }),
        params: z.object({
          id: z.string().min(1),
        }),
      });

      mockReq.body = { name: "John" };
      mockReq.query = { sort: "asc" };
      mockReq.params = { id: "123" };

      validateRequest(schema)(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    })
  })

  describe("when request is invalid", () => {
    it("should throw ApiError.BadRequest for invalid email", () => {
      const schema = z.object({
        body: z.object({
          email: z.email(),
        }),
        query: ZodEmptyObject,
        params: ZodEmptyObject,
      })

      mockReq.body = { email: "invalid-email" };

      expect(() => {
        validateRequest(schema)(mockReq, mockRes, mockNext);
      }).toThrow(ApiError);
      expect(mockNext).not.toHaveBeenCalled();
    })

    it("should throw ApiError with detailed error message and details", () => {
      const schema = z.object({
        body: z.object({
          email: z.email(),
          password: z.string().min(8)
        }),
        query: ZodEmptyObject,
        params: ZodEmptyObject,
      })
      mockReq.body = {
        email: "invalid",
        password: "123",
      };

      try {
        validateRequest(schema)(mockReq, mockRes, mockNext);
        fail("Should have thrown ApiError");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);

        const apiError = error as ApiError;
        expect(apiError.statusCode).toBe(StatusCodes.BAD_REQUEST);
        expect(apiError.message).toContain("Validation error:");
        expect(apiError.message).toContain("body.email");
        expect(apiError.message).toContain("body.password");
        expect(apiError.details).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: "body.email",
              message: expect.any(String),
            }),
            expect.objectContaining({
              path: "body.password",
              message: expect.any(String),
            }),
          ])
        );
      }

    })
    it("should throw ApiError for multiple validation errors across body, query, params", () => {
      const schema = z.object({
        body: z.object({
          email: z.email(),
          profile: z.object({
            age: z.number().int().min(18)
          })
        }),
        query: z.object({
          page: z.coerce.number().int().min(1)
        }),
        params: z.object({
          userId: z.string().min(1)
        }),
      })

      mockReq = {
        body: {
          email: "@gmail.com",
          profile: { age: 17 },
        },
        query: { page: "0" },
        params: { userId: "" },
      } as unknown as Request;

      try {
        validateRequest(schema)(mockReq, mockRes, mockNext);
        fail("Should have thrown ApiError");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(mockNext).not.toHaveBeenCalled();

        const apiError = error as ApiError
        expect(apiError.statusCode).toBe(StatusCodes.BAD_REQUEST);

        expect(apiError.message).toContain("Validation error:")
        expect(apiError.message).toContain("body.email")
        expect(apiError.message).toContain("body.profile.age")
        expect(apiError.message).toContain("query.page")
        expect(apiError.message).toContain("params.userId")

        expect(apiError.details).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ path: 'body.email', message: expect.any(String) }),
            expect.objectContaining({ path: 'body.profile.age', message: expect.any(String) }),
            expect.objectContaining({ path: 'query.page', message: expect.any(String) }),
            expect.objectContaining({ path: 'params.userId', message: expect.any(String) }),
          ])
        )
      }
    })

    it("should throw ApiError for missing required fields", () => {
      const schema = z.object({
        body: z.object({
          name: z.string().min(1),
          email: z.email(),
        }),
        query: ZodEmptyObject,
        params: ZodEmptyObject,
      });

      mockReq.body = {};

      try {
        validateRequest(schema)(mockReq, mockRes, mockNext);
        fail("Should have thrown ApiError");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);

        const apiError = error as ApiError;
        expect(apiError.statusCode).toBe(StatusCodes.BAD_REQUEST);
        expect(apiError.details).toHaveLength(2);
      }
    })
  })
})

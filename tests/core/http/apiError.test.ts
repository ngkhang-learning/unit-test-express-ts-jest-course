import { StatusCodes } from "http-status-codes";

import { ApiError } from "~/core/http/ApiError";

describe("ApiError", () => {
  describe("Constructor", () => {
    it("should create error with statusCode, message, and details", () => {
      const mockMessage = "Somethings went wrong";
      const mockStatusCode = StatusCodes.BAD_REQUEST;
      const mockDetails = { field: "email", issue: "invalid format" };

      const error = new ApiError(mockStatusCode, mockMessage, mockDetails);

      expect(error.statusCode).toBe(mockStatusCode);
      expect(error.message).toBe(mockMessage);
      expect(error.details).toEqual(mockDetails);
    })

    it("should be instance of both ApiError and Error", () => {
      const error = new ApiError(StatusCodes.BAD_REQUEST, "Test Error")

      expect(error).toBeInstanceOf(ApiError);
      expect(error).toBeInstanceOf(Error);
    })

    it("should have stack trace containing error info", () => {
      const error = new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal Server Error");

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe("string");
      expect(error.stack).toContain("Error");
    })

    it("should handle undefined details", () => {
      const error = new ApiError(StatusCodes.NOT_FOUND, "Not Found");

      expect(error.details).toBeUndefined();
    })
  })

  describe("Static Factory Methods", () => {
    it("BadRequest (400): should create BadRequest with default message", () => {
      const error = ApiError.BadRequest();

      expect(error.message).toBe("Bad Request")
      expect(error.statusCode).toBe(StatusCodes.BAD_REQUEST)
      expect(error.details).toBeUndefined()
    })

    it("BadRequest (400): should create BadRequest with custom message and details", () => {
      const mockMessage = "Invalid input";
      const mockDetails = { field: "email", issue: "Invalid format" };

      const error = ApiError.BadRequest(mockMessage, mockDetails);

      expect(error.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(error.message).toBe(mockMessage);
      expect(error.details).toEqual(mockDetails);
    })
  })
})

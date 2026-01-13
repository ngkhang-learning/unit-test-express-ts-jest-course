import { ObjectId } from "mongodb";

import { objectIdToString } from "~/utils/objectIdToString";

describe("objectIdToString", () => {
  it("should delegate to ObjectId.toHexString()", () => {
    const strId = "507f1f77bcf86cd799439011";
    const objectId = new ObjectId(strId);
    const result = objectIdToString(objectId);

    expect(result).toBe(strId);
    expect(result).toBe(objectId.toHexString());
  });

  it("should return valid 24-character hex string", () => {
    const objectId = new ObjectId();
    const result = objectIdToString(objectId);

    expect(result).toMatch(/^[a-f0-9]{24}$/);
    expect(result).toHaveLength(24);
  });

  it("should handle newly created ObjectId", () => {
    const objectId = new ObjectId();
    const result = objectIdToString(objectId);

    expect(typeof result).toBe("string");
    expect(result).toBe(objectId.toHexString());
  });

  it("should produce consistent results for same ObjectId", () => {
    const objectId = new ObjectId();
    const result1 = objectIdToString(objectId);
    const result2 = objectIdToString(objectId);

    expect(result1).toBe(result2);
  });
});

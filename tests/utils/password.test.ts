
import { hashPassword, verifyPassword } from "~/utils/password";

describe("Password utils", () => {
  const validPassword = "Khang@1234";
  const invalidPassword = "WrongPassword";

  describe("hashPassword", () => {
    it("should hash password to 60-character bcrypt format", async () => {
      const hashedPassword = await hashPassword(validPassword);

      expect(hashedPassword).not.toBe(validPassword);
      expect(hashedPassword).toMatch(/^\$2[aby]\$/)
      expect(hashedPassword).toHaveLength(60)
    })

    it("should generate unique hashes for same password", async () => {
      const hash1 = await hashPassword(validPassword);
      const hash2 = await hashPassword(validPassword);

      expect(hash1).not.toBe(hash2);
    });

    it("should hash different passwords differently", async () => {
      const hash1 = await hashPassword(validPassword);
      const hash2 = await hashPassword(invalidPassword);

      expect(hash1).not.toBe(hash2);
    });

    it("should handle empty string password", async () => {
      const hashedPassword = await hashPassword("");

      expect(hashedPassword).toMatch(/^\$2[aby]\$/);
      expect(hashedPassword).toHaveLength(60);
    });
  });

  describe("verifyPassword", () => {
    it("should return true for correct password", async () => {
      const hashedPassword = await hashPassword(validPassword);
      const isValid = await verifyPassword(validPassword, hashedPassword);

      expect(isValid).toBe(true);
    });

    it("should return false for incorrect password", async () => {
      const hashedPassword = await hashPassword(validPassword);
      const isValid = await verifyPassword(invalidPassword, hashedPassword);

      expect(isValid).toBe(false);
    });

    it("should return false for invalid hash format", async () => {
      const isValid = await verifyPassword(validPassword, "invalid-hash");

      expect(isValid).toBe(false);
    });

    it("should return false for empty hash", async () => {
      const isValid = await verifyPassword(validPassword, "");

      expect(isValid).toBe(false);
    });

    it("should be case-sensitive", async () => {
      const hashedPassword = await hashPassword(validPassword);
      const isValid = await verifyPassword(validPassword.toLowerCase(), hashedPassword);

      expect(isValid).toBe(false);
    });
  })
})

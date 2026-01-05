
import { hashPassword, verifyPassword } from "~/utils/password";

describe("Password utils", () => {
  describe("hashPassword", () => {
    it("should hash password to 60-character bcrypt format", async () => {
      const password = "Khang@1234";
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).not.toBe(password)
      expect(hashedPassword).toMatch(/^\$2[aby]\$/)
      expect(hashedPassword).toHaveLength(60)
    })

    it("should generate unique hashed for same password", async () => {
      const password = "Khang@1234";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2)
    })
  })

  describe("verifyPassword", () => {
    it("should return true for correct password", async () => {
      const password = "Khang@1234";
      const hashedPassword = await hashPassword(password);
      const isValidPassword = await verifyPassword(password, hashedPassword)

      expect(isValidPassword).toBe(true);
    });

    it("should return false for incorrect password", async () => {
      const password = "Khang@1234";
      const wrongPassword = "WrongPassword";
      const hashedPassword = await hashPassword(password);
      const isValidPassword = await verifyPassword(wrongPassword, hashedPassword)

      expect(isValidPassword).toBe(false);
    });

    it("should return false for invalid hash format", async () => {
      const password = "Khang@1234";
      const invalidHash = "invalid-hash";
      const isValidPassword = await verifyPassword(password, invalidHash)

      expect(isValidPassword).toBe(false);
    });
  })
})

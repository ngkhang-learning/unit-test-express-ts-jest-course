import { RegisterSchema } from "~/modules/users/user.validation"


describe("User Validation", () => {
  describe("RegisterSchema", () => {
    const generateMockData = (body?: Partial<any>, query?: Partial<any>, params?: Partial<any>) => {
      return {
        body: {
          email: 'ngkhang@gmail.com',
          username: 'ngkhang',
          password: 'abc@123456',
          ...body
        },
        query: { ...query },
        params: { ...params },
      }
    }

    it("should pass validation", () => {
      const result = RegisterSchema.safeParse(generateMockData());
      expect(result.success).toBe(true);
    })

    it("should fail validation when 'body' is missing", () => {
      const result = RegisterSchema.safeParse({});
      expect(result.success).toBe(false);
    })

    it("should fail validation when email in body is invalid", () => {
      const result = RegisterSchema.safeParse(generateMockData({ email: "invalid" }));
      expect(result.success).toBe(false);
    })

    it("should fail validation when password in body is short", () => {
      const result = RegisterSchema.safeParse(generateMockData({ password: '1234' }));
      expect(result.success).toBe(false);
    })

    it("should pass validation when query or params properties is not effect", () => {
      const result = RegisterSchema.safeParse(generateMockData({}, { age: '122' }, { userID: "aasajj-12121nn-212" }));
      expect(result.success).toBe(true);
    })
  })
})

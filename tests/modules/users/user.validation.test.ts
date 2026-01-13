import { RegisterSchema } from "~/modules/users/user.validation";


describe("User Validation", () => {
  describe("RegisterSchema", () => {
    const generateMockData = (
      body?: Partial<any>,
      query?: Partial<any>,
      params?: Partial<any>
    ) => {
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
    };

    describe("Valid data", () => {
      it("should pass validation with correct data", () => {
        const result = RegisterSchema.safeParse(generateMockData());

        expect(result.success).toBe(true);
      });

      it("should ignore additional properties in query/params", () => {
        const result = RegisterSchema.safeParse(
          generateMockData({}, { age: '122' }, { userID: "aasajj-12121nn-212" })
        );

        expect(result.success).toBe(true);
      });
    });


    describe("Invalid data", () => {
      it("should fail validation when 'body' is missing", () => {
        const result = RegisterSchema.safeParse({});

        expect(result.success).toBe(false);
      });

      it("should fail validation when email is invalid", () => {
        const result = RegisterSchema.safeParse(generateMockData({ email: "invalid" }));

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.some(i => i.path.includes('email'))).toBe(true);
        }
      });

      it("should fail validation when password is too short", () => {
        const result = RegisterSchema.safeParse(generateMockData({ password: '1234' }));

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.some(i => i.path.includes('password'))).toBe(true);
        }
      });

      it("should fail validation when username is too short", () => {
        const result = RegisterSchema.safeParse(generateMockData({ username: 'a' }));

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.some(i => i.path.includes('username'))).toBe(true);
        }
      });

      it("should fail validation when email is missing", () => {
        const result = RegisterSchema.safeParse(
          generateMockData({ email: undefined })
        );

        expect(result.success).toBe(false);
      });

      it("should fail validation with multiple errors", () => {
        const result = RegisterSchema.safeParse(
          generateMockData({ email: "invalid", password: "123" })
        );

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
        }
      });
    });
  });
});

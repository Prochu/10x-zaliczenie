import { describe, it, expect } from "vitest";
import { matchIdParamSchema, betUpsertCommandSchema } from "./matches";

describe("matches validation schemas", () => {
  describe("matchIdParamSchema", () => {
    it("should validate a valid UUID", () => {
      const validUuid = "550e8400-e29b-41d4-a716-446655440000";
      const result = matchIdParamSchema.safeParse({ matchId: validUuid });
      expect(result.success).toBe(true);
    });

    it("should fail for an invalid UUID", () => {
      const result = matchIdParamSchema.safeParse({ matchId: "not-a-uuid" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("matchId must be a valid UUID");
      }
    });
  });

  describe("betUpsertCommandSchema", () => {
    it("should validate valid scores", () => {
      const result = betUpsertCommandSchema.safeParse({ homeScore: 2, awayScore: 1 });
      expect(result.success).toBe(true);
    });

    it("should validate zero scores", () => {
      const result = betUpsertCommandSchema.safeParse({ homeScore: 0, awayScore: 0 });
      expect(result.success).toBe(true);
    });

    it("should fail for negative scores", () => {
      const result = betUpsertCommandSchema.safeParse({ homeScore: -1, awayScore: 0 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("homeScore must be non-negative");
      }
    });

    it("should fail for non-integer scores", () => {
      const result = betUpsertCommandSchema.safeParse({ homeScore: 1.5, awayScore: 2 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("homeScore must be an integer");
      }
    });

    it("should fail for missing scores", () => {
      const result = betUpsertCommandSchema.safeParse({ homeScore: 1 });
      expect(result.success).toBe(false);
    });
  });
});

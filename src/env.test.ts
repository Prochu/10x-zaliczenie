import { describe, it, expect } from "vitest";

describe("Environment Setup", () => {
  it("should have access to environment variables", () => {
    expect(process.env.PUBLIC_SUPABASE_URL).toBe("https://test.supabase.co");
  });

  it("should be able to run a simple test", () => {
    expect(1 + 1).toBe(2);
  });
});

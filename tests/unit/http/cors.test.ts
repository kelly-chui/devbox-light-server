import { describe, expect, it } from "vitest";
import { readCorsOrigin } from "../../../src/api/middleware/cors.js";

describe("readCorsOrigin", () => {
  it("allows every origin by default", () => {
    expect(readCorsOrigin(undefined)).toBe("*");
    expect(readCorsOrigin("")).toBe("*");
    expect(readCorsOrigin("   ")).toBe("*");
  });

  it("uses a configured origin", () => {
    expect(readCorsOrigin(" http://localhost:5173 ")).toBe(
      "http://localhost:5173",
    );
  });
});

import { describe, it, expect } from "vitest";
import { listUsersSafe } from "./client/neverthrow.gen";
import { server } from "./mocks/server";
import { http, HttpResponse } from "msw";
import { a } from "vitest/dist/chunks/suite.d.FvehnV49.js";

describe("API Tests with MSW", () => {
  it("should fetch users successfully", async () => {
    const result = await listUsersSafe({});

    if (result.isErr()) {
      console.log("Error:", result.error);
    }

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      const users = result.value.data.users;
      expect(users).toHaveLength(2);
      expect(users[0]).toEqual({
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "John Doe",
        email: "john@example.com",
        status: "active",
        createdAt: "2023-01-01T00:00:00Z",
      });
    }
  });

  it("should handle 500 internal server error", async () => {
    // Override the handler to return a 500 error
    server.use(
      http.get("https://api.testservice.com/v1/users", () => {
        return HttpResponse.json(
          { message: "internal server error" },
          { status: 500 },
        );
      }),
    );

    const result = await listUsersSafe({});

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) {
      throw new Error("expected result to be an error");
    }
    const error = result.error;

    switch (error.status) {
      case 500:
        expect(error.error.message).toEqual("internal server error");
        return;
      case 400:
        throw new Error("expected error status to be 500");
      default:
        assertNever(error);
    }
  });
});

function assertNever(n: never) {
  return n;
}

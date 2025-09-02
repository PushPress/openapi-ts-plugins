import { describe, it, expect } from "vitest";
import {
  listUsersToolOptions,
  createUserToolOptions,
  getUserByIdToolOptions,
  deleteUserToolOptions,
} from "../client/tools.gen";

describe("Tools Plugin Tests", () => {
  describe("Tool Options", () => {
    it("should have correct structure for read operations", () => {
      expect(listUsersToolOptions).toEqual({
        name: "listUsers",
        description: "Retrieve a list of users with optional filtering",
        parameters: expect.any(Object), // zod schema
        execute: expect.any(Function),
      });

      expect(getUserByIdToolOptions).toEqual({
        name: "getUserById",
        description: "Retrieve a specific user by their ID",
        parameters: expect.any(Object), // zod schema
        execute: expect.any(Function),
      });
    });

    it("should have needsApproval for mutation operations", () => {
      expect(createUserToolOptions).toEqual({
        name: "createUser",
        description: "Create a new user",
        parameters: expect.any(Object), // zod schema
        execute: expect.any(Function),
        needsApproval: true,
      });

      expect(deleteUserToolOptions).toEqual({
        name: "deleteUser",
        description: "Delete a user by ID",
        parameters: expect.any(Object), // zod schema
        execute: expect.any(Function),
        needsApproval: true,
      });
    });
  });

  describe("Tool Execution", () => {
    it("should execute listUsers tool successfully", async () => {
      const result = await listUsersToolOptions.execute({});

      expect(result.data).toEqual({
        users: [
          {
            id: "550e8400-e29b-41d4-a716-446655440000",
            name: "John Doe",
            email: "john@example.com",
            status: "active",
            createdAt: "2023-01-01T00:00:00Z",
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440001",
            name: "Jane Smith",
            email: "jane@example.com",
            status: "active",
            createdAt: "2023-01-02T00:00:00Z",
          },
        ],
      });
    });

    it("should execute getUserById tool successfully", async () => {
      const result = await getUserByIdToolOptions.execute({
        path: { userId: "550e8400-e29b-41d4-a716-446655440000" },
      });

      expect(result.data).toEqual({
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "John Doe",
        email: "john@example.com",
        status: "active",
        createdAt: "2023-01-01T00:00:00Z",
      });
    });

    it("should execute createUser tool successfully", async () => {
      const newUser = {
        name: "New User",
        email: "new@example.com",
        status: "active" as const,
      };

      const result = await createUserToolOptions.execute({
        body: newUser,
      });

      expect(result.data).toEqual({
        id: expect.any(String),
        ...newUser,
        createdAt: expect.any(String),
      });
    });
  });
});


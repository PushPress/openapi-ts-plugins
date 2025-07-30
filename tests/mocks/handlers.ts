import { http, HttpResponse } from "msw";

export const handlers = [
  // Mock GET /users endpoint
  http.get("https://api.testservice.com/v1/users", () => {
    return HttpResponse.json({
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
  }),

  // Add more API endpoint handlers here as needed
];

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listUsersSafe } from '../src/client/neverthrow.gen';
import * as sdk from '../src/client/sdk.gen';
import { AxiosResponse } from 'axios';

// Mock the SDK functions
vi.mock('../src/client/sdk.gen', () => ({
  listUsers: vi.fn(),
  createUser: vi.fn(),
  deleteUser: vi.fn(),
  getUserById: vi.fn(),
  updateUser: vi.fn(),
  getUserPosts: vi.fn(),
  createPost: vi.fn(),
}));

describe('Neverthrow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return ResultAsync.Ok when SDK call succeeds', async () => {
    const mockResponse = { data: { users: [{ id: 1, name: 'John' }] } };
    vi.mocked(sdk.listUsers).mockResolvedValue(mockResponse as AxiosResponse);

    const result = await listUsersSafe({}).unwrapOr(null);

    expect(result).toEqual(mockResponse);
    expect(sdk.listUsers).toHaveBeenCalledWith({});
  });

  it('should return ResultAsync.Err when SDK call fails', async () => {
    const mockError = new Error('API Error');
    vi.mocked(sdk.listUsers).mockRejectedValue(mockError);

    const result = await listUsersSafe({});

    result.match(
      (success) => {
        throw new Error(`Expected error, got success: ${success}`);
      },
      (error) => expect(error).toBe(mockError),
    );
  });
});


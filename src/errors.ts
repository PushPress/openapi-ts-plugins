/* eslint-disable @typescript-eslint/no-explicit-any */

// transforms an error object into a union
export type IIMT<T extends Record<string, any>> = {
  [K in keyof T]: {
    error: T[K];
    status: K;
  };
}[keyof T];

// todo: generic function implementation
//
export function mapErrorToUnion<T extends { [x: number]: Record<string, any> }>(
  error: T,
) {
  return Object.entries(error).map(([key, val]) => ({
    status: key,
    ...val,
  })) as IIMT<T>[];
}

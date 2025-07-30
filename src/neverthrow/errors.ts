import { MyPlugin } from "./types";

export const ERROR_UTILITIES_ID = "errors";

export const HANDLE_AXIOS_ERROR = "handleAxiosError";

/**
 * Adds error utilities generated output
 * @param plugin - k
 */
export const createErrorHandler = (plugin: MyPlugin["Instance"]) => {
  const file = plugin.createFile({
    id: ERROR_UTILITIES_ID,
    path: "errors",
  });

  const content = `import { AxiosError } from 'axios';

export type ErrorTaggedUnion<T extends Record<string, unknown>> = {
  [K in keyof T]: {
    error: T[K];
    status: K;
  };
};

export const handleAxiosError = <T extends Record<string, unknown>>(
  error: AxiosError
): ErrorTaggedUnion<T> => {
  return {
    status: error.status,
    error: error.response?.data,
  } as ErrorTaggedUnion<T>;
};`;
  file.add(content);
};

import { beforeAll, afterEach, afterAll } from "vitest";
import { server } from "./server";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

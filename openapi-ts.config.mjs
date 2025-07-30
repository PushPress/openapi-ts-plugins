import { defineConfig, defaultPlugins } from "@hey-api/openapi-ts";
import { defineConfig as plugin } from "./src/neverthrow/config";

export default defineConfig({
  input: "test-api.json",
  output: {
    format: "prettier",
    path: "tests/client",
  },
  plugins: [
    ...defaultPlugins,
    { name: "@hey-api/sdk", validator: false },
    { name: "@hey-api/client-axios", throwOnError: true },
    plugin(),
  ],
});

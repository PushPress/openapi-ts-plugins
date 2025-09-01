import { defineConfig, defaultPlugins } from "@hey-api/openapi-ts";
import { defineConfig as neverthrowPlugin } from "./src/neverthrow/config";

import { defineConfig as toolPlugin } from "./src/tools/config";

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
    neverthrowPlugin(),
    toolPlugin(),
  ],
});

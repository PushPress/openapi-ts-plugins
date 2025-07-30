import { definePluginConfig } from "@hey-api/openapi-ts";

import { handler } from "./plugin";
import type { MyPlugin } from "./types";

export const defaultConfig: MyPlugin["Config"] = {
  config: {
    exportFromIndex: true,
  },
  dependencies: ["@hey-api/typescript"],
  handler,
  name: "neverthrow",
  output: "neverthrow",
};

/**
 * Type helper for `my-plugin` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);

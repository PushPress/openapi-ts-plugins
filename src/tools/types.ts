import type { DefinePlugin } from "@hey-api/openapi-ts";

export type UserConfig = {
  /**
   * Plugin name. Must be unique.
   */
  name: "ai-tools";

  exportFromIndex: true;
  /**
   *  sdk tool call to target
   *
   *  currently only supports openai
   *
   * @default "openai"
   */
  myOption?: "openai";
};

export type MyPlugin = DefinePlugin<UserConfig>;

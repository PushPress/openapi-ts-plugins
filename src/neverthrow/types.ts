import type { DefinePlugin } from "@hey-api/openapi-ts";

export type UserConfig = {
  /**
   * Plugin name. Must be unique.
   */
  name: "neverthrow";

  exportFromIndex: true;
  /**
   * Name of the generated file.
   *
   * @default 'my-plugin'
   */
  output?: string;
  // /**
  //  * User-configurable option for your plugin.
  //  *
  //  * @default false
  //  */
  // myOption?: boolean;
};

export type MyPlugin = DefinePlugin<UserConfig>;

import { defineConfig } from "@rslib/core";

export default defineConfig({
  lib: [
    {
      bundle: false,
      format: "esm",
      syntax: "es2024",
      dts: true,
      output: {
        sourceMap: true,
      },
    },
    {
      bundle: false,
      format: "cjs",
      syntax: "es2024",
      dts: false,
      output: {
        sourceMap: true,
      },
    },
  ],
});

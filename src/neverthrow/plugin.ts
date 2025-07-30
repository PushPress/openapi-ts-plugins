import { createErrorHandler } from "./errors";
import type { MyPlugin } from "./types";
import { createNeverthrow } from "./wrapper";

export const handler: MyPlugin["Handler"] = ({ plugin }) => {
  // create neverthrow.gen.ts
  plugin.createFile({
    id: plugin.name,
    path: plugin.output,
  });

  // create errors.gen.ts
  createErrorHandler(plugin);

  plugin.forEach("operation", (event) => {
    createNeverthrow({
      operation: event.operation,
      plugin,
    });
  });
};

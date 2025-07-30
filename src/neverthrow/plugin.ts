import { createErrorHandler } from './errors';
import type { MyPlugin } from './types';
import { createNeverthrowWrapper } from './wrapper';

export const handler: MyPlugin['Handler'] = ({ plugin }) => {
  const file = plugin.createFile({
    id: plugin.name,
    path: plugin.output,
  });

  // create errors.gen.ts
  createErrorHandler(plugin);

  plugin.forEach('operation', (event) => {
    file.add(
      createNeverthrowWrapper({
        operation: event.operation,
        plugin,
      }),
    );
  });
};

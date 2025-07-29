import type { MyPlugin } from './types';
import { createNeverthrowWrapper } from './wrapper';

export const handler: MyPlugin['Handler'] = ({ plugin }) => {
  // create an output file. it will not be
  // generated until it contains nodes
  const file = plugin.createFile({
    id: plugin.name,
    path: plugin.output,
  });

  plugin.forEach('operation', 'requestBody', (event) => {
    if (event.type === 'operation') {
      const statement = createNeverthrowWrapper({
        operation: event.operation,
        plugin,
      });
      file.add(statement);
    }
  });
};

import { defineConfig, defaultPlugins } from '@hey-api/openapi-ts';
import { defineConfig as plugin } from './src';

export default defineConfig({
  input: 'test-api.json',
  output: {
    format: 'prettier',
    path: 'src/client',
  },
  plugins: [
    ...defaultPlugins,
    { name: '@hey-api/sdk', validator: true },
    { name: '@hey-api/client-axios', throwOnError: true },
    { name: 'zod', responses: true },
    plugin(),
  ],
});

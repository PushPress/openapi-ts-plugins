# @pushpress/openapi-ts-plugins

A collection of plugins for [@hey-api/openapi-ts](https://heyapi.vercel.app/) that enhance generated TypeScript clients with additional functionality and type safety.

## Plugins

### Neverthrow Plugin

The neverthrow plugin wraps generated API client functions with [neverthrow](https://github.com/supermacro/neverthrow)'s `Result` type for functional error handling. Instead of throwing exceptions, API calls return `Result<T, E>` types that make error handling explicit and type-safe.

**Features:**

- Wraps all OpenAPI operations with `ResultAsync<T, ErrorType>`
- Creates typed error unions based on OpenAPI error responses
- Maintains full type safety with generated TypeScript types

## Installation

```bash
pnpm install @pushpress/openapi-ts-plugins
```

## Usage

### Basic Setup

Add the plugin to your `openapi-ts.config.mjs`:

This plugin works best with

- Axios as the HTTP client
- SDK validation disabled
- throwOnError enabled so the result type is properly typed

```javascript
import { defineConfig, defaultPlugins } from '@hey-api/openapi-ts';
import { defineConfig as neverthrowPlugin } from '@pushpress/openapi-ts-plugins/neverthrow';

export default defineConfig({
  input: 'path/to/your/openapi.json',
  output: {
    path: 'src/client',
  },
  plugins: [
    ...defaultPlugins,
    { name: '@hey-api/sdk', validator: false },
    { name: '@hey-api/client-axios', throwOnError: true },
    neverthrowPlugin(),
  ],
});
```

### Generated Code Example

Instead of:

```typescript
// Traditional approach - throws exceptions
try {
  const user = await getUser({ id: 123 });
  console.log(user);
} catch (error) {
  // Handle error
}
```

You get:

```typescript
// With neverthrow plugin - explicit error handling
const result = await getUserSafe({ id: 123 });
if (result.isOk()) {
  console.log(result.value);
} else {
  // result.error is properly typed based on OpenAPI spec
  console.error(result.error);
}
```

## Development

### Setup

Install dependencies:

```bash
pnpm install
```

### Build

Build the library:

```bash
pnpm build
```

Build in watch mode:

```bash
pnpm dev
```

### Testing

Run tests:

```bash
pnpm test
```

The project includes comprehensive tests using Vitest and MSW for mocking API responses.

### Generate Test Client

Generate the test client from the OpenAPI spec:

```bash
pnpm gen
```

## Project Structure

```
src/
├── index.ts              # Main plugin exports
└── neverthrow/           # Neverthrow plugin implementation
    ├── config.ts         # Plugin configuration
    ├── errors.ts         # Error handling utilities
    ├── index.ts          # Plugin exports
    ├── plugin.ts         # Core plugin logic
    ├── types.ts          # TypeScript type definitions
    └── wrapper.ts        # Function wrapper generation
```

## Dependencies

- **Runtime**: `axios`, `zod`
- **Peer**: `neverthrow` (^8.2.0)
- **Build**: `@rslib/core`, `@hey-api/openapi-ts`
- **Testing**: `vitest`, `msw`


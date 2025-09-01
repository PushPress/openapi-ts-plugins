# @pushpress/openapi-ts-plugins

A collection of plugins for [@hey-api/openapi-ts](https://heyapi.vercel.app/) that enhance generated TypeScript clients with additional functionality and type safety.

## Plugins

### Neverthrow Plugin

The neverthrow plugin wraps generated API client functions with [neverthrow](https://github.com/supermacro/neverthrow)'s `Result` type for functional error handling. Instead of throwing exceptions, API calls return `Result<T, E>` types that make error handling explicit and type-safe.

**Features:**

- Wraps all OpenAPI operations with `ResultAsync<T, ErrorType>`
- Creates typed error unions based on OpenAPI error responses
- Maintains full type safety with generated TypeScript types

### AI Tools Plugin

The AI tools plugin generates structured tool definitions from OpenAPI operations, making it easy to integrate your API with AI systems that support tool calling (like OpenAI's function calling). Each OpenAPI operation is transformed into a tool object with proper schema validation.

**Features:**

- Generates tool definitions for each OpenAPI operation
- Uses Zod schemas for parameter validation
- Compatible with OpenAI function calling format
- Maintains type safety with generated TypeScript types
- Includes operation descriptions and summaries as tool documentation

## Installation

```bash
pnpm install @pushpress/openapi-ts-plugins
```

### For Neverthrow Plugin

If you're using the neverthrow plugin, you also need to install neverthrow:

```bash
pnpm install neverthrow
```

### For AI Tools Plugin

If you're using the ai-tools plugin, you also need to install the OpenAI agents package:

```bash
pnpm install @openai/agents
```

## Usage

### Basic Setup

Add the plugin to your `openapi-ts.config.mjs`:

This plugin works best with

- Axios as the HTTP client
- SDK validation disabled
- throwOnError enabled so the result type is properly typed

```javascript
import { defineConfig, defaultPlugins } from "@hey-api/openapi-ts";
import { neverthrow, tools } from "@pushpress/openapi-ts-plugins";

export default defineConfig({
  input: "path/to/your/openapi.json",
  output: {
    path: "src/client",
  },
  plugins: [
    ...defaultPlugins,
    { name: "@hey-api/sdk", validator: false },
    { name: "@hey-api/client-axios", throwOnError: true },
    neverthrow.defineConfig(), // neverthrow plugin
    tools.defineConfig(), // ai-tools plugin
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

### AI Tools Example

With the AI tools plugin, your OpenAPI operations are transformed into structured tool definitions:

```typescript
// Generated from your OpenAPI spec
import { getUserTool, createUserTool } from "./client/tools";

import { Agent, webSearchTool, fileSearchTool } from "@openai/agents";

// Each tool contains:
// - name: operation ID
// - description: from OpenAPI operation
// - parameters: Zod schema for validation
// - exec: the actual API function

const agent = new Agent({
  name: "Travel assistant",
  tools: [tool(getUserTool), tool(createUserTool)],
});
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

## Dependencies

- **Runtime**: `axios`, `zod`
- **Required for neverthrow plugin**: `neverthrow` (^8.2.0)
- **Required for ai-tools plugin**: `@openai/agents`

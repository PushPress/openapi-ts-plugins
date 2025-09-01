import { AnyZodObject } from "zod/v3";
import type { MyPlugin } from "./types";
import { IR } from "@hey-api/openapi-ts";
import { compiler as tsc } from "@hey-api/openapi-ts";

export interface OpenaiTool<Parameters extends AnyZodObject> {
  name: string;
  description: string;
  parameters: Parameters;
  execute(parames: Parameters["shape"]): unknown;
}
export const createTool = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: MyPlugin["Instance"];
}) => {
  const file = plugin.context.file({ id: plugin.name })!;
  const pluginZod = plugin.getPlugin("zod")!;
  const zodFile = plugin.context.file({ id: "zod" });

  file.import({
    module: file.relativePathToFile({
      context: plugin.context,
      id: "sdk",
    }),
    name: operation.id,
  });

  const toolName = `${operation.id}Tool`;

  const requestSchemaName = zodFile?.getName(
    pluginZod.api.getId({ operation, type: "data" }),
  );

  file.import({
    module: file.relativePathToFile({ context: plugin.context, id: "zod" }),
    name: requestSchemaName,
  });

  const toolExpression = tsc.objectExpression({
    obj: [
      {
        key: "name",
        value: operation.id,
      },

      {
        key: "description",
        value: operation.description,
      },
      {
        key: "parameters",
        value: requestSchemaName,
      },
      {
        key: "exec",
        value: operation.id,
      },
    ],
    identifiers: ["parameters", "exec"],
    comments: [operation.summary, operation.description],
  });

  const statement = tsc.constVariable({
    exportConst: true,
    expression: toolExpression,
    name: toolName,
  });

  file.add(statement);
};

export const handler: MyPlugin["Handler"] = ({ plugin }) => {
  // create tool.gen.ts
  plugin.createFile({
    id: plugin.name,
    path: plugin.output,
  });

  plugin.forEach("operation", (event) => {
    createTool({
      ...event,
      plugin,
    });
  });
};

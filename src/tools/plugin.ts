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
  const toolOptionsName = `${toolName}Options`;

  const requestSchemaName = zodFile?.getName(
    pluginZod.api.getId({ operation, type: "data" }),
  );

  file.import({
    module: "@openai/agents",
    name: "tool",
  });

  file.import({
    module: file.relativePathToFile({ context: plugin.context, id: "zod" }),
    name: requestSchemaName,
  });

  const isMutation =
    operation.method &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(operation.method.toUpperCase());

  const toolOptionsObj = [
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
      key: "execute",
      value: operation.id,
    },
  ];

  if (isMutation) {
    toolOptionsObj.push({
      key: "needsApproval",
      //@ts-expect-error -- this type signature is wrong. we need a boolean here
      value: true,
    });
  }

  const toolOptionsExpression = tsc.objectExpression({
    obj: toolOptionsObj,
    identifiers: ["parameters", "execute"],
  });

  const optionsStatement = tsc.constVariable({
    exportConst: true,
    expression: toolOptionsExpression,
    name: toolOptionsName,
    comment: [operation.summary, operation.description],
  });

  const toolStatement = tsc.constVariable({
    exportConst: true,
    expression: tsc.callExpression({
      functionName: "tool",
      parameters: [tsc.identifier({ text: toolOptionsName })],
    }),
    name: toolName,
  });

  file.add(optionsStatement, toolStatement);
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

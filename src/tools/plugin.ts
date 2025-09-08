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

  file.import({
    module: file.relativePathToFile({
      context: plugin.context,
      id: "sdk",
    }),
    name: operation.id,
  });

  const toolName = `${operation.id}Tool`;
  const toolOptionsName = `${toolName}Options`;

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
      value: operation.description ?? operation.summary ?? "",
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
    identifiers: ["execute"],
  });

  const optionsStatement = tsc.constVariable({
    exportConst: true,
    expression: toolOptionsExpression,
    name: toolOptionsName,
    comment: [operation.summary, operation.description],
  });

  file.add(optionsStatement);
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

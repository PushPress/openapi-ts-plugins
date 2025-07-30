import type { MyPlugin } from "./types";
import { IR } from "@hey-api/openapi-ts";
import { compiler as tsc } from "@hey-api/openapi-ts";
import { ERROR_UTILITIES_ID, HANDLE_AXIOS_ERROR } from "./errors";

export const createNeverthrowWrapper = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: MyPlugin["Instance"];
}) => {
  const file = plugin.context.file({ id: plugin.name })!;
  // Add error utilities file and import from it

  // Import the original SDK function
  // const sdkFile = plugin.context.file({ id: sdkId })!;
  const sdkFunctionName = operation.id;

  const sdkImport = file.import({
    module: file.relativePathToFile({
      context: plugin.context,
      id: "sdk",
    }),
    name: sdkFunctionName,
  });

  file.import({
    module: file.relativePathToFile({
      context: plugin.context,
      id: ERROR_UTILITIES_ID,
    }),
    name: HANDLE_AXIOS_ERROR,
  });

  file.import({
    asType: true,
    module: "axios",
    name: "AxiosError",
  });

  const resultImport = file.import({
    module: "neverthrow",
    name: "ResultAsync",
  });

  // Get TypeScript types for function signature
  const pluginTypeScript = plugin.getPlugin("@hey-api/typescript")!;
  const fileTypeScript = plugin.context.file({ id: "types" })!;

  // Get the data type for parameters
  const dataTypeName = fileTypeScript.getName(
    pluginTypeScript.api.getId({ operation, type: "data" }),
  );
  const errorTypeName = fileTypeScript.getName(
    pluginTypeScript.api.getId({ operation, type: "errors" }),
  );

  file.import({
    asType: true,
    module: file.relativePathToFile({ context: plugin.context, id: "types" }),
    name: dataTypeName,
  });

  file.import({
    asType: true,
    module: file.relativePathToFile({ context: plugin.context, id: "types" }),
    name: fileTypeScript.getName(
      pluginTypeScript.api.getId({ operation, type: "errors" }),
    ),
  });

  const optionsType = tsc.typeReferenceNode({
    typeName: "Options",
    typeArguments: [tsc.typeNode(dataTypeName), tsc.typeNode("true")], // Will override throwOnError value
  });

  // Generate function name
  const functionName = `${operation.id}Safe`;

  file.import({
    asType: true,
    module: file.relativePathToFile({
      context: plugin.context,
      id: "sdk",
    }),
    name: "Options",
  });

  // Create the function body
  const functionBody = tsc.returnStatement({
    expression: tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: resultImport.name || "ResultAsync",
        name: "fromPromise",
      }),
      parameters: [
        tsc.callExpression({
          functionName: sdkImport.name || sdkFunctionName,
          parameters: [tsc.identifier({ text: "options" })],
        }),
        tsc.arrowFunction({
          parameters: [{ name: "error" }],
          statements: tsc.callExpression({
            functionName: "handleAxiosError",
            parameters: [
              tsc.asExpression({
                expression: tsc.identifier({ text: "error" }),
                type: tsc.typeNode("AxiosError"),
              }),
            ],
            types: [tsc.typeNode(errorTypeName ?? "unknown")],
          }),
        }),
      ],
    }),
  });

  // Create the complete function
  const statement = tsc.constVariable({
    exportConst: true,
    expression: tsc.arrowFunction({
      parameters: [
        {
          name: "options",
          type: optionsType,
        },
      ],
      // returnType,
      statements: [functionBody],
    }),
    name: functionName,
  });

  return statement;
};

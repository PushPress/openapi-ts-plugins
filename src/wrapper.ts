import type { MyPlugin } from './types';
import { IR } from '@hey-api/openapi-ts';
import { compiler as tsc } from '@hey-api/openapi-ts';

const sdkId = 'sdk';
const typesId = 'types';

export const createNeverthrowWrapper = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: MyPlugin['Instance'];
}) => {
  const file = plugin.context.file({ id: plugin.name })!;

  // Import the original SDK function
  // const sdkFile = plugin.context.file({ id: sdkId })!;
  const sdkFunctionName = operation.id;

  const sdkImport = file.import({
    module: file.relativePathToFile({
      context: plugin.context,
      id: sdkId,
    }),
    name: sdkFunctionName,
  });

  // Import Result from neverthrow
  const resultImport = file.import({
    module: 'neverthrow',
    name: 'ResultAsync',
  });

  // Get TypeScript types for function signature
  const pluginTypeScript = plugin.getPlugin('@hey-api/typescript')!;
  const fileTypeScript = plugin.context.file({ id: typesId })!;

  // Get the data type for parameters
  const dataTypeName = fileTypeScript.getName(
    pluginTypeScript.api.getId({ operation, type: 'data' }),
  );
  const errorTypeName = fileTypeScript.getName(
    pluginTypeScript.api.getId({ operation, type: 'errors' }),
  );

  file.import({
    asType: true,
    module: file.relativePathToFile({ context: plugin.context, id: typesId }),
    name: dataTypeName,
  });

  const optionsType = tsc.typeReferenceNode({
    typeName: 'Options',
    typeArguments: [tsc.typeNode(dataTypeName), tsc.typeNode('true')],
  });

  // // Get response and error types
  // const responseImport = file.import({
  //   asType: true,
  //   module: file.relativePathToFile({ context: plugin.context, id: typesId }),
  //   name: fileTypeScript.getName(
  //     pluginTypeScript.api.getId({ operation, type: 'responses' }),
  //   ),
  // });
  //
  // TODO: transform the error type into a tagged union of errors
  file.import({
    asType: true,
    module: file.relativePathToFile({ context: plugin.context, id: typesId }),
    name: fileTypeScript.getName(
      pluginTypeScript.api.getId({ operation, type: 'errors' }),
    ),
  });

  // Generate function name
  const functionName = `${operation.id}Safe`;

  file.import({
    asType: true,
    module: file.relativePathToFile({
      context: plugin.context,
      id: sdkId,
    }),
    name: 'Options',
  });

  // Add options parameter if the original function needs it

  // Create the return type: Result<ResponseType, ErrorType>
  // TODO: come up with good annotations for this
  // const returnType = tsc.typeReferenceNode({
  //   typeName: 'ResultAsync',
  //   typeArguments: [
  //     tsc.typeNode(responseImport.name || 'unknown'),
  //     tsc.typeNode('unknown'), // TODO: generate the correct imports
  //   ],
  // });

  // Create the function body
  const functionBody = tsc.returnStatement({
    expression: tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: resultImport.name || 'Result',
        name: 'fromPromise',
      }),
      parameters: [
        tsc.callExpression({
          functionName: sdkImport.name || sdkFunctionName,
          parameters: [tsc.identifier({ text: 'options' })],
        }),
        // TODO: build up an function mapper that returns a transformed version of the error
        tsc.arrowFunction({
          parameters: [{ name: 'error' }],
          statements: tsc.asExpression({
            expression: tsc.identifier({ text: 'error' }),
            type: tsc.typeNode(errorTypeName ?? 'unknown'),
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
          name: 'options',
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

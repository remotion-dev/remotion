import {stringifyDefaultProps, type EnumPath} from '@remotion/studio-shared';
import * as recast from 'recast';
import {parse} from 'recast/parsers/babel-ts';

export const updateDefaultProps = async ({
	input,
	compositionId,
	newDefaultProps,
	enumPaths,
}: {
	input: string;
	compositionId: string;
	newDefaultProps: Record<string, unknown>;
	enumPaths: EnumPath[];
}): Promise<string> => {
	const ast = recast.parse(input, {
		parser: {parse},
	});

	recast.types.visit(ast, {
		visitJSXElement(path) {
			const openingElement = path.node.openingElement as any;
			//	1: ensure its the element we're looking for
			if (
				openingElement.name.name === 'Composition' &&
				openingElement.attributes.some(
					(attr: any) =>
						attr.name.name === 'id' && attr.value.value === compositionId,
				)
			) {
				//	2: Find the defaultProps attribute and handle related errors
				const defaultPropsAttr = openingElement.attributes.find(
					(attr: any) => attr.name.name === 'defaultProps',
				);
				if (!defaultPropsAttr) {
					throw new Error(
						`No \`defaultProps\` prop found in the <Composition/> tag with the ID "${compositionId}".`,
					);
				}

				//	3: ensure only hardcoded values are provided

				const defaultPropsValue = defaultPropsAttr.value.expression; // Get the value of defaultProps
				if (
					defaultPropsValue.type !== 'ObjectExpression' &&
					defaultPropsValue.type !== 'ObjectLiteralExpression' &&
					defaultPropsValue.type !== 'AsExpression' &&
					defaultPropsValue.type !== 'TSAsExpression'
				) {
					throw new Error(
						`\`defaultProps\` prop does not have a hardcoded value in the <Composition/> tag with the ID "${defaultPropsValue.type}".`,
					);
				}

				//	4: modify the code

				defaultPropsAttr.value.expression = recast.types.builders.identifier(
					stringifyDefaultProps({props: newDefaultProps, enumPaths}),
				);
			}

			this.traverse(path); // Continue traversing the AST
		},
	});

	//	5: finally, format the file
	// eslint-disable-next-line @typescript-eslint/consistent-type-imports
	type PrettierType = typeof import('prettier');
	let prettier: PrettierType | null = null;

	try {
		prettier = await import('prettier');
	} catch {
		throw new Error('Prettier cannot be found in the current project.');
	}

	const {format, resolveConfig, resolveConfigFile} = prettier as PrettierType;

	const configFilePath = await resolveConfigFile();
	if (!configFilePath) {
		throw new Error('The Prettier config file was not found');
	}

	const prettierConfig = await resolveConfig(configFilePath);
	if (!prettierConfig) {
		throw new Error(
			'The Prettier config file was not found. For this feature, the "prettier" package must be installed and a .prettierrc file must exist.',
		);
	}

	const finalfile = recast.print(ast).code;

	const prettified = await format(finalfile, {
		...prettierConfig,
		filepath: 'test.tsx',
		plugins: [],
		endOfLine: 'auto',
	});
	return prettified;
};

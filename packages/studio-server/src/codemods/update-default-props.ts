import {stringifyDefaultProps, type EnumPath} from '@remotion/studio-shared';
import * as recast from 'recast';
import * as tsParser from 'recast/parsers/babel-ts';

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
}): Promise<Promise<Promise<Promise<string>>>> => {
	const ast = recast.parse(input, {
		parser: tsParser,
	});

	recast.types.visit(ast, {
		visitJSXElement(path) {
			const {openingElement} = path.node;
			//	1: ensure its the element we're looking for
			const openingName = openingElement.name;
			if (
				openingName.type !== 'JSXIdentifier' &&
				openingName.type !== 'JSXNamespacedName'
			) {
				this.traverse(path); // Continue traversing the AST
				return;
			}

			if (openingName.name !== 'Composition' && openingName.name !== 'Still') {
				this.traverse(path); // Continue traversing the AST
				return;
			}

			if (
				!openingElement.attributes?.some((attr) => {
					if (attr.type === 'JSXSpreadAttribute') {
						return;
					}

					if (!attr.value) {
						return;
					}

					if (attr.value.type === 'JSXElement') {
						return;
					}

					if (attr.value.type === 'JSXExpressionContainer') {
						return;
					}

					if (attr.value.type === 'JSXFragment') {
						return;
					}

					return attr.name.name === 'id' && attr.value.value === compositionId;
				})
			) {
				this.traverse(path); // Continue traversing the AST
				return;
			}

			//	2: Find the defaultProps attribute and handle related errors
			const defaultPropsAttr = openingElement.attributes.find((attr) => {
				if (attr.type === 'JSXSpreadAttribute') {
					this.traverse(path); // Continue traversing the AST
					return;
				}

				return attr.name.name === 'defaultProps';
			});

			if (!defaultPropsAttr) {
				throw new Error(
					`No \`defaultProps\` prop found in the <Composition/> tag with the ID "${compositionId}".`,
				);
			}

			if (defaultPropsAttr.type === 'JSXSpreadAttribute') {
				this.traverse(path); // Continue traversing the AST
				return;
			}

			//	3: ensure only hardcoded values are provided
			if (
				!defaultPropsAttr.value ||
				defaultPropsAttr.value.type === 'JSXElement' ||
				defaultPropsAttr.value.type === 'JSXText' ||
				defaultPropsAttr.value.type === 'StringLiteral' ||
				defaultPropsAttr.value.type === 'NumericLiteral' ||
				defaultPropsAttr.value.type === 'BigIntLiteral' ||
				defaultPropsAttr.value.type === 'DecimalLiteral' ||
				defaultPropsAttr.value.type === 'NullLiteral' ||
				defaultPropsAttr.value.type === 'BooleanLiteral' ||
				defaultPropsAttr.value.type === 'RegExpLiteral' ||
				defaultPropsAttr.value.type === 'JSXFragment' ||
				defaultPropsAttr.value.type === 'Literal'
			) {
				throw new Error(
					`\`defaultProps\` prop must be a hardcoded value in the <Composition/> tag, but it is a ${defaultPropsAttr.value?.type}".`,
				);
			}

			const defaultPropsValue = defaultPropsAttr.value.expression;
			if (
				defaultPropsValue.type !== 'ObjectExpression' &&
				defaultPropsValue.type !== 'TSAsExpression'
			) {
				throw new Error(
					`\`defaultProps\` prop must be a hardcoded value in the <Composition/> tag with the ID "${compositionId}".`,
				);
			}

			defaultPropsAttr.value.expression = recast.types.builders.identifier(
				stringifyDefaultProps({props: newDefaultProps, enumPaths}),
			);

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

import {stringifyDefaultProps, type EnumPath} from '@remotion/studio-shared';
import * as recast from 'recast';
import {formatInlineContent} from './format-inline-content';
import {parseAst} from './parse-ast';

// Recast uses tabWidth=4 for column counting, so columns don't
// correspond to character indices when tabs are present.
// This converts a recast loc (line/column) to a character offset.
const RECAST_TAB_WIDTH = 4;

const recastLocToOffset = (
	input: string,
	loc: {line: number; column: number},
): number => {
	const lines = input.split('\n');
	let offset = 0;
	for (let i = 0; i < loc.line - 1; i++) {
		offset += lines[i].length + 1;
	}

	// Convert recast's tab-expanded column to character index
	const line = lines[loc.line - 1];
	let col = 0;
	for (let i = 0; i < line.length; i++) {
		if (col >= loc.column) {
			return offset + i;
		}

		col += line[i] === '\t' ? RECAST_TAB_WIDTH : 1;
	}

	return offset + line.length;
};

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
}): Promise<{output: string; formatted: boolean}> => {
	const ast = parseAst(input);
	const stringified = stringifyDefaultProps({
		props: newDefaultProps,
		enumPaths,
	});

	let replaceStart: number | undefined;
	let replaceEnd: number | undefined;

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

			// Capture source positions for direct string replacement
			// instead of modifying the AST and serializing (avoids recast artifacts)
			const valueLoc = defaultPropsAttr.value.loc;
			if (!valueLoc) {
				throw new Error('Could not determine source location of defaultProps');
			}

			replaceStart = recastLocToOffset(input, valueLoc.start);
			replaceEnd = recastLocToOffset(input, valueLoc.end);

			this.traverse(path); // Continue traversing the AST
		},
	});

	if (replaceStart === undefined || replaceEnd === undefined) {
		throw new Error(
			`Could not find defaultProps for composition "${compositionId}"`,
		);
	}

	// linePrefix includes the JSX container opening brace
	const lineStart = input.lastIndexOf('\n', replaceStart) + 1;
	const linePrefix = input.substring(lineStart, replaceStart + 1);

	const {formatted, didFormat} = await formatInlineContent({
		inlineContent: stringified,
		linePrefix,
		endOfLine: 'auto',
	});

	// Replace the JSX expression container in the original input
	const output =
		input.substring(0, replaceStart) +
		'{' +
		formatted +
		'}' +
		input.substring(replaceEnd);

	return {output, formatted: didFormat};
};

/** Line of the matching `<Composition>` / `<Still>` opening tag (for log links). */
export const getCompositionDefaultPropsLine = ({
	input,
	compositionId,
}: {
	input: string;
	compositionId: string;
}): number => {
	const ast = parseAst(input);
	let line = 1;
	let found = false;

	recast.types.visit(ast, {
		visitJSXElement(path) {
			if (found) {
				this.traverse(path);
				return;
			}

			const {openingElement} = path.node;
			const openingName = openingElement.name;
			if (
				openingName.type !== 'JSXIdentifier' &&
				openingName.type !== 'JSXNamespacedName'
			) {
				this.traverse(path);
				return;
			}

			if (openingName.name !== 'Composition' && openingName.name !== 'Still') {
				this.traverse(path);
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
				this.traverse(path);
				return;
			}

			found = true;
			line = openingElement.loc?.start.line ?? path.node.loc?.start.line ?? 1;
			this.traverse(path);
		},
	});

	return line;
};

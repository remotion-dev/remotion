import {stringifyDefaultProps, type EnumPath} from '@remotion/studio-shared';
import * as recast from 'recast';
import {recastLocToOffset} from './recast-loc-to-offset';
import {parseAst} from './sequence-props/parse-ast';

export type FormatInline = (options: {
	inlineContent: string;
	linePrefix: string;
	endOfLine: 'auto' | 'lf';
}) => Promise<{formatted: string; didFormat: boolean}>;

/**
 * Instead of running prettier on the entire file (which is slow),
 * format only a small snippet of inline content (e.g. stringified defaultProps).
 *
 * We wrap the content in `const __x__ = CONTENT;` and adjust printWidth
 * so prettier makes the same line-breaking decisions as if the content
 * were at its actual column position in the file.
 */
export const formatInlineContentWithFormatter = async ({
	inlineContent,
	linePrefix,
	endOfLine,
	prettierConfig,
	format,
}: {
	inlineContent: string;
	linePrefix: string;
	endOfLine: 'auto' | 'lf';
	prettierConfig: Record<string, unknown>;
	format: (source: string, options: Record<string, unknown>) => Promise<string>;
}): Promise<{formatted: string; didFormat: boolean}> => {
	const tabWidth = (prettierConfig.tabWidth as number) ?? 2;
	const baseIndent = linePrefix.match(/^(\s*)/)?.[1] ?? '';

	// Calculate visual column offset (tabs expand to tabWidth columns)
	const columnOffset = [...linePrefix].reduce(
		(col, ch) => (ch === '\t' ? col + tabWidth : col + 1),
		0,
	);

	// Adjust printWidth so the wrapper prefix occupies the same visual
	// width as the actual file prefix, ensuring identical line breaks.
	const configPrintWidth = (prettierConfig.printWidth as number) ?? 80;
	const wrapperPrefix = 'const __x__ = ';
	const effectivePrintWidth = Math.max(
		configPrintWidth - columnOffset + wrapperPrefix.length,
		20,
	);

	const wrappedSource = `${wrapperPrefix}${inlineContent};\n`;
	const formattedWrapped = await format(wrappedSource, {
		...prettierConfig,
		printWidth: effectivePrintWidth,
		filepath: 'test.tsx',
		endOfLine,
	});

	// Extract the formatted value from the wrapper
	const withoutSemicolon = formattedWrapped.replace(/;\s*$/, '');
	const wrappedInParentheses = withoutSemicolon.startsWith(
		`${wrapperPrefix}(\n`,
	);
	let formattedProps: string;

	if (withoutSemicolon.startsWith(wrapperPrefix) && !wrappedInParentheses) {
		formattedProps = withoutSemicolon.slice(wrapperPrefix.length);
	} else {
		// Prettier broke the line after `=` — extract and dedent one level
		const lines = withoutSemicolon
			.split('\n')
			.slice(1, wrappedInParentheses ? -1 : undefined);
		const useTabs = prettierConfig.useTabs as boolean;
		const oneIndent = useTabs ? '\t' : ' '.repeat(tabWidth);
		formattedProps = lines
			.map((l) => (l.startsWith(oneIndent) ? l.slice(oneIndent.length) : l))
			.join('\n');
	}

	// Add base indentation to all lines except the first
	const indentedProps = formattedProps
		.split('\n')
		.map((line, i) =>
			i === 0 ? line : line.length > 0 ? baseIndent + line : line,
		)
		.join('\n');

	return {formatted: indentedProps, didFormat: true};
};

export const updateDefaultProps = async ({
	input,
	compositionId,
	newDefaultProps,
	enumPaths,
	formatInline,
}: {
	input: string;
	compositionId: string;
	newDefaultProps: Record<string, unknown>;
	enumPaths: EnumPath[];
	formatInline: FormatInline;
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

	const {formatted, didFormat} = await formatInline({
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

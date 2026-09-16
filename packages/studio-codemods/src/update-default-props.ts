import {stringifyDefaultProps, type EnumPath} from '@remotion/studio-shared';
import * as recast from 'recast';
import {recastLocToOffset} from './recast-loc-to-offset';
import {parseAst} from './sequence-props/parse-ast';
import {
	getSourceFormattingConfig,
	normalizePrintedIndentation,
} from './source-style';

const identifierRegex = /^[A-Za-z_$][0-9A-Za-z_$]*$/;

export const updateDefaultProps = ({
	input,
	compositionId,
	newDefaultProps,
	enumPaths,
}: {
	input: string;
	compositionId: string;
	newDefaultProps: Record<string, unknown>;
	enumPaths: EnumPath[];
}): {output: string} => {
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
	const previousValue = input.slice(replaceStart + 1, replaceEnd - 1).trim();
	const inlineObjectSpacing = previousValue.match(
		/\{([\t ]*)(?=(?:["'][^"']+["']|[$A-Z_a-z][$\w]*)[\t ]*:)/,
	)?.[1];
	const bracketSpacing = previousValue.startsWith('{ ')
		? true
		: previousValue.startsWith('{') &&
			  !previousValue.startsWith('{\n') &&
			  !previousValue.startsWith('{\r\n')
			? false
			: inlineObjectSpacing === undefined
				? null
				: inlineObjectSpacing.length > 0;
	const formattingConfig = getSourceFormattingConfig({
		input,
		prettierConfigOverride: bracketSpacing === null ? null : {bracketSpacing},
	});
	const valueAst = parseAst(`__defaultProps = ${stringified}`);
	const statement = valueAst.program.body[0];
	if (
		statement?.type !== 'ExpressionStatement' ||
		statement.expression.type !== 'AssignmentExpression'
	) {
		throw new Error('Could not parse the updated defaultProps value');
	}

	const expression = statement.expression.right;
	recast.types.visit(expression, {
		visitObjectProperty(path) {
			const {node} = path;
			if (
				!node.computed &&
				node.key.type === 'StringLiteral' &&
				identifierRegex.test(node.key.value)
			) {
				node.key = recast.types.builders.identifier(node.key.value);
			}

			this.traverse(path);
		},
	});

	const printExpression = ({
		trailingComma,
		wrapColumn,
	}: {
		trailingComma: boolean;
		wrapColumn: number;
	}) => {
		const printed = recast.prettyPrint(expression, {
			objectCurlySpacing: formattingConfig.bracketSpacing,
			quote: formattingConfig.quote,
			tabWidth: formattingConfig.tabWidth,
			trailingComma,
			useTabs: false,
			wrapColumn,
		}).code;

		return normalizePrintedIndentation({
			endOfLine: formattingConfig.endOfLine,
			indentationUnit: formattingConfig.indentationUnit,
			printed,
			tabWidth: formattingConfig.tabWidth,
		});
	};

	const compactLines = printExpression({
		trailingComma: false,
		wrapColumn: Number.POSITIVE_INFINITY,
	})
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean);
	const compact = compactLines.reduce((result, line) => {
		if (result.length === 0) {
			return line;
		}

		const omitSeparator =
			!formattingConfig.bracketSpacing &&
			(result.endsWith('{') || line.startsWith('}'));
		return `${result}${omitSeparator ? '' : ' '}${line}`;
	}, '');
	const columnOffset = [...linePrefix].reduce(
		(column, character) =>
			character === '\t' ? column + formattingConfig.tabWidth : column + 1,
		0,
	);
	const compactWidth = [...compact].reduce(
		(column, character) =>
			character === '\t' ? column + formattingConfig.tabWidth : column + 1,
		0,
	);
	const baseIndent = linePrefix.match(/^([\t ]*)/)?.[1] ?? '';
	const effectivePrintWidth = Math.max(
		formattingConfig.printWidth - columnOffset,
		20,
	);
	const multiline = printExpression({
		trailingComma: true,
		wrapColumn: effectivePrintWidth,
	})
		.split(/\r?\n/)
		.filter((line) => line.trim().length > 0)
		.map((line, index) =>
			index === 0 || line.length === 0 ? line : baseIndent + line,
		)
		.join(formattingConfig.endOfLine);
	const formatted =
		columnOffset + compactWidth + 1 <= formattingConfig.printWidth
			? compact
			: multiline;

	// Replace the JSX expression container in the original input
	const output =
		input.substring(0, replaceStart) +
		'{' +
		formatted +
		'}' +
		input.substring(replaceEnd);

	return {output};
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

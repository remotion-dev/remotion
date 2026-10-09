import * as recast from 'recast';
import {parseAst} from './sequence-props/parse-ast';
import {
	getSourceFormattingConfig,
	normalizePrintedIndentation,
} from './source-style';

const identifierRegex = /^[A-Za-z_$][0-9A-Za-z_$]*$/;

export const formatSerializedValue = ({
	input,
	linePrefix,
	previousValue,
	serialized,
}: {
	input: string;
	linePrefix: string;
	previousValue: string | null;
	serialized: string;
}) => {
	const inlineObjectSpacing = previousValue?.match(
		/\{([\t ]*)(?=(?:["'][^"']+["']|[$A-Z_a-z][$\w]*)[\t ]*:)/,
	)?.[1];
	const bracketSpacing =
		previousValue === null
			? null
			: previousValue.startsWith('{ ')
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
	const valueAst = parseAst(`__value = ${serialized}`);
	const statement = valueAst.program.body[0];
	if (
		statement?.type !== 'ExpressionStatement' ||
		statement.expression.type !== 'AssignmentExpression'
	) {
		throw new Error('Could not parse the serialized value');
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

	return columnOffset + compactWidth + 1 <= formattingConfig.printWidth
		? compact
		: multiline;
};

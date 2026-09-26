import {expect, test} from 'bun:test';
import * as recast from 'recast';
import {
	getEndOfLine,
	getIndentationUnit,
	getLineIndent,
	getSourceFormattingConfig,
	indentContinuationLinesAtOffset,
	printNodeWithSourceStyle,
} from '../source-style';

test.each([
	[
		'a header comment',
		'/**\n * Comment\n */\nconst f = () => {\n    return 1;\n};',
		'    ',
	],
	[
		'a deeply indented first line',
		'const f = () => (\n        <div>\n            <span />\n        </div>\n);',
		'    ',
	],
	[
		'an aligned continuation',
		'const value = call(\n                   argument);\nconst f = () => {\n  if (value) {\n    return 1;\n  }\n};',
		'  ',
	],
	[
		'a tab in a comment',
		'// Example:\n\t// indented comment\nconst f = () => {\n    return 1;\n};',
		'    ',
	],
	[
		'a stray tab-indented line',
		'const f = () => {\n\tconst a = 1;\n  if (a) {\n    return a;\n  }\n};',
		'  ',
	],
])('infers indentation despite %s', (_name, input, expected) => {
	expect(getIndentationUnit(input, null)).toBe(expected);
});

test('infers formatting choices from source', () => {
	const input = "import {thing} from 'pkg'\r\n\r\n\tconst value = 1\r\n";

	expect(
		getSourceFormattingConfig({input, prettierConfigOverride: null}),
	).toEqual({
		bracketSpacing: false,
		endOfLine: '\r\n',
		indentationUnit: '\t',
		printWidth: 80,
		quote: 'single',
		semi: false,
		singleQuote: true,
		tabWidth: 2,
		useTabs: true,
	});
});

test('indents continuation lines using the surrounding source', () => {
	const input = 'const value = (\r\n\tfirst\r\n);\r\n';
	const offset = input.indexOf('first');

	expect(getEndOfLine(input)).toBe('\r\n');
	expect(getLineIndent({input, offset})).toBe('\t');
	expect(
		indentContinuationLinesAtOffset({
			input,
			offset,
			printed: 'first\nsecond',
		}),
	).toBe('first\r\n\tsecond');
});

test('prints nodes with inferred quote, semicolon, indentation, and EOL styles', () => {
	const b = recast.types.builders;
	const body = b.blockStatement([
		b.variableDeclaration('const', [
			b.variableDeclarator(b.identifier('value'), b.stringLiteral('hello')),
		]),
		b.returnStatement(b.identifier('value')),
	]);
	const input = "if (ready) {\r\n\tconst existing = 'value'\r\n}\r\n";

	expect(
		printNodeWithSourceStyle({
			input,
			node: body,
			prettierConfigOverride: null,
			wrapColumn: null,
		}),
	).toBe("{\r\n\tconst value = 'hello'\r\n\treturn value\r\n}");
});

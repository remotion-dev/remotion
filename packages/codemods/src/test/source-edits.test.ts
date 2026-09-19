import {expect, test} from 'bun:test';
import {ensureNamedImports} from '../sequence-props/imports';
import {parseAst} from '../sequence-props/parse-ast';
import {
	applySourceEdits,
	captureImportSnapshots,
	getInsertImportSourceEdits,
} from '../source-edits';

const addImport = (input: string) => {
	const ast = parseAst(input);
	const snapshots = captureImportSnapshots(ast);
	ensureNamedImports({
		ast,
		importedNames: new Set(['added']),
		sourcePath: 'pkg',
	});

	return applySourceEdits({
		input,
		edits: getInsertImportSourceEdits({
			ast,
			input,
			prettierConfigOverride: null,
			snapshots,
		}),
	});
};

test('keeps byte order marks and file pragmas before new imports', () => {
	expect(
		addImport("\uFEFF// @ts-nocheck\nconst value = 'single quote'\n"),
	).toBe(
		"\uFEFF// @ts-nocheck\nimport { added } from 'pkg'\nconst value = 'single quote'\n",
	);
});

test('keeps TypeScript triple-slash directives before new imports', () => {
	expect(addImport('/// <reference types="bun" />\nconst value = 1;\n')).toBe(
		'/// <reference types="bun" />\nimport { added } from "pkg";\nconst value = 1;\n',
	);
});

test('keeps next-line lint comments attached to their statement', () => {
	expect(
		addImport("// eslint-disable-next-line no-console\nconsole.log('value')\n"),
	).toBe(
		"import { added } from 'pkg'\n// eslint-disable-next-line no-console\nconsole.log('value')\n",
	);
});

test('keeps file-level lint comments before new imports', () => {
	expect(addImport("/* eslint-disable no-console */\nconsole.log('value')\n"))
		.toBe(`/* eslint-disable no-console */
import { added } from 'pkg'
console.log('value')
`);
});

test('reports overlapping generic source edits', () => {
	expect(() =>
		applySourceEdits({
			input: 'source',
			edits: [
				{start: 0, end: 3, replacement: 'a'},
				{start: 2, end: 4, replacement: 'b'},
			],
		}),
	).toThrow('Overlapping source edit ranges');
});

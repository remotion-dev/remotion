import {expect, test} from 'bun:test';
import assert from 'node:assert';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {getFieldsToShow} from '@remotion/studio-shared';
import {Internals} from 'remotion';
import {parseAst} from '../codemods/parse-ast';
import {updateSequencePropsAst} from '../codemods/update-sequence-props/update-sequence-props';
import {lineColumnToNodePath} from '../preview-server/routes/can-update-sequence-props';
import {prettify} from './test-utils';

test('Should correctly separate discriminated union for layout', () => {
	const schemaFields = getFieldsToShow({
		schema: Internals.sequenceSchema,
		currentRuntimeValueDotNotation: {
			layout: 'none',
		},
		nodePath: {
			absolutePath: '',
			nodePath: [],
			sequenceKeys: [],
			effectKeys: [],
		},
		getCodeValues: () => undefined,
		getDragOverrides: () => ({}),
	});
	expect(schemaFields?.map((s) => s.key)).toEqual(['layout']);
});

test('Should expose absolute-fill variant fields when active', () => {
	const schemaFields = getFieldsToShow({
		schema: Internals.sequenceSchema,
		currentRuntimeValueDotNotation: {
			layout: 'absolute-fill',
		},
		nodePath: {
			absolutePath: '',
			nodePath: [],
			sequenceKeys: [],
			effectKeys: [],
		},
		getCodeValues: () => undefined,
		getDragOverrides: () => ({}),
	});
	expect(schemaFields?.map((s) => s.key)).toEqual([
		'layout',
		'style.translate',
		'style.scale',
		'style.rotate',
		'style.opacity',
		'premountFor',
	]);
});

test('Should be able to update a discriminated union', async () => {
	const file = readFileSync(
		path.join(__dirname, 'snapshots', 'discriminated-union.tsx'),
		'utf-8',
	);

	const ast = parseAst(file);

	const nodePath = lineColumnToNodePath(ast, 3);
	assert(nodePath, 'No node path found');

	const update = updateSequencePropsAst({
		input: file,
		nodePath,
		updates: [
			{
				key: 'layout',
				value: 'none',
				defaultValue: Internals.sequenceSchema.layout.default,
			},
		],
		schema: Internals.sequenceSchema,
	});

	const expected = readFileSync(
		path.join(__dirname, 'snapshots', 'discriminated-union-expected.tsx'),
		'utf-8',
	);

	expect(await prettify(update.serialized)).toBe(await prettify(expected));
});

test('Should remove variant-specific props when switching enum value', async () => {
	const file = readFileSync(
		path.join(__dirname, 'snapshots', 'discriminated-union-with-style.tsx'),
		'utf-8',
	);

	const ast = parseAst(file);

	const nodePath = lineColumnToNodePath(ast, 3);
	assert(nodePath, 'No node path found');

	const update = updateSequencePropsAst({
		input: file,
		nodePath,
		updates: [
			{
				key: 'layout',
				value: 'none',
				defaultValue: Internals.sequenceSchema.layout.default,
			},
		],
		schema: Internals.sequenceSchema,
	});

	const expected = readFileSync(
		path.join(
			__dirname,
			'snapshots',
			'discriminated-union-with-style-expected.tsx',
		),
		'utf-8',
	);

	expect(await prettify(update.serialized)).toBe(await prettify(expected));
});

test('Should remove premountFor and styleWhile* when switching to layout="none"', async () => {
	const file = readFileSync(
		path.join(__dirname, 'snapshots', 'discriminated-union-with-premount.tsx'),
		'utf-8',
	);

	const ast = parseAst(file);

	const nodePath = lineColumnToNodePath(ast, 3);
	assert(nodePath, 'No node path found');

	const update = updateSequencePropsAst({
		input: file,
		nodePath,
		updates: [
			{
				key: 'layout',
				value: 'none',
				defaultValue: Internals.sequenceSchema.layout.default,
			},
		],
		schema: Internals.sequenceSchema,
	});

	const expected = readFileSync(
		path.join(
			__dirname,
			'snapshots',
			'discriminated-union-with-premount-expected.tsx',
		),
		'utf-8',
	);

	expect(await prettify(update.serialized)).toBe(await prettify(expected));
});

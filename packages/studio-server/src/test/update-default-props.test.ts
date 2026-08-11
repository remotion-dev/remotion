import {expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {
	getCompositionDefaultPropsLine,
	updateDefaultProps,
} from '../codemods/update-default-props';
import {prettify} from './test-utils';

test('Should be able to update default props', async () => {
	const file = readFileSync(
		path.join(__dirname, 'snapshots', 'root-before.tsx'),
		'utf-8',
	);
	const expected = readFileSync(
		path.join(__dirname, 'snapshots', 'root-after.tsx'),
		'utf-8',
	);

	const {output} = await updateDefaultProps({
		input: file,
		compositionId: 'Comp3',
		newDefaultProps: {abc: 'def', newDate: 'remotion-date:2022-01-02'},
		enumPaths: [],
	});

	expect(await prettify(output)).toBe(await prettify(expected));
});

test('getCompositionDefaultPropsLine returns the opening tag line (ast-types visitor must traverse)', () => {
	const file = readFileSync(
		path.join(__dirname, 'snapshots', 'root-before.tsx'),
		'utf-8',
	);

	expect(
		getCompositionDefaultPropsLine({
			input: file,
			compositionId: 'Comp3',
		}),
	).toBe(27);
});

test('Should be able to update default props', async () => {
	const file = readFileSync(
		path.join(__dirname, 'snapshots', 'problematic.tsx'),
		'utf-8',
	);
	const expected = readFileSync(
		path.join(__dirname, 'snapshots', 'fixed.tsx'),
		'utf-8',
	);

	const {output} = await updateDefaultProps({
		input: file,
		compositionId: 'schema-test',
		newDefaultProps: {abc: 'def', newDate: 'remotion-date:2022-01-02'},
		enumPaths: [],
	});

	expect(await prettify(output)).toBe(await prettify(expected));
});

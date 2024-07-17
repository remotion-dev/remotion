import {expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {updateDefaultProps} from '../codemods/update-default-props';

test('Should be able to update default props', async () => {
	const file = readFileSync(
		path.join(__dirname, 'snapshots', 'root-before.tsx'),
		'utf-8',
	);
	const expected = readFileSync(
		path.join(__dirname, 'snapshots', 'root-after.tsx'),
		'utf-8',
	);

	const update = await updateDefaultProps({
		input: file,
		compositionId: 'Comp3',
		newDefaultProps: {abc: 'def', newDate: 'remotion-date:2022-01-02'},
		enumPaths: [],
	});

	expect(update).toBe(expected);
});

test('Should be able to update default props', async () => {
	const file = readFileSync(
		path.join(__dirname, 'snapshots', 'problematic.txt'),
		'utf-8',
	);
	const expected = readFileSync(
		path.join(__dirname, 'snapshots', 'fixed.txt'),
		'utf-8',
	);

	const update = await updateDefaultProps({
		input: file,
		compositionId: 'schema-test',
		newDefaultProps: {abc: 'def', newDate: 'remotion-date:2022-01-02'},
		enumPaths: [],
	});

	expect(update).toBe(expected);
});

import {expect, test} from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {parseChunksFlag} from '../../cli/helpers/get-chunks-from-cli';

test('returns null when --chunks is not passed', () => {
	expect(parseChunksFlag(undefined)).toBe(null);
});

test('parses --chunks passed as inline JSON', () => {
	expect(parseChunksFlag('[[0,59],[60,374]]')).toEqual([
		[0, 59],
		[60, 374],
	]);
});

test('reads --chunks from a JSON file when given a path', () => {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'remotion-chunks-'));
	const file = path.join(dir, 'chunks.json');
	fs.writeFileSync(file, '[[0, 9], [10, 19]]');

	try {
		expect(parseChunksFlag(file)).toEqual([
			[0, 9],
			[10, 19],
		]);
	} finally {
		fs.rmSync(dir, {recursive: true, force: true});
	}
});

test('leaves the shape of valid JSON to validateChunks()', () => {
	expect(parseChunksFlag(5)).toBe(5 as never);
});

test('throws a readable error when --chunks is neither JSON nor a file', () => {
	expect(() => parseChunksFlag('[[0,59],')).toThrow(
		'--chunks needs to be a JSON array of [startFrame, endFrame] pairs, or a path to a JSON file containing one, but got: [[0,59],',
	);
});

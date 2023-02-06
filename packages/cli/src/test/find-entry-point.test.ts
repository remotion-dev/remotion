import path from 'path';
import {expect, test} from 'vitest';
import {findEntryPoint} from '../entry-point';

test('Should accept URL as entry point', () => {
	const entryPoint = findEntryPoint(
		['https://www.example.com'],
		path.resolve(process.cwd(), '..', 'example')
	);

	expect(entryPoint.file).toBe('https://www.example.com');
	expect(entryPoint.remainingArgs).toEqual([]);
	expect(entryPoint.reason).toEqual('argument passed');
});

test('Should find entry point automatically', () => {
	const entryPoint = findEntryPoint(
		[],
		path.resolve(process.cwd(), '..', 'example')
	);

	expect(entryPoint.file).toBe('src/index.ts');
	expect(entryPoint.remainingArgs).toEqual([]);
	expect(entryPoint.reason).toEqual('common paths');
});

test('Should use explicit entry point', () => {
	const entryPoint = findEntryPoint(
		['src/ts-entry.tsx'],
		path.resolve(process.cwd(), '..', 'example')
	);

	expect(entryPoint.file).toBe(
		path.resolve(process.cwd(), '..', 'example/src/ts-entry.tsx')
	);
	expect(entryPoint.remainingArgs).toEqual([]);
	expect(entryPoint.reason).toEqual('argument passed - found in root');
});

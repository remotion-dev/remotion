import {expect, test} from 'bun:test';
import path from 'node:path';
import {findEntryPoint} from '../entry-point';

test('Should accept URL as entry point', () => {
	const entryPoint = findEntryPoint({
		args: ['https://www.example.com'],
		remotionRoot: path.resolve(process.cwd(), '..', 'example'),
		logLevel: 'info',
		allowDirectory: true,
	});

	expect(entryPoint.file).toBe('https://www.example.com');
	expect(entryPoint.remainingArgs).toEqual([]);
	expect(entryPoint.reason).toEqual('argument passed');
});

test('Should find entry point automatically', () => {
	const entryPoint = findEntryPoint({
		args: [],
		remotionRoot: path.resolve(process.cwd(), '..', 'example'),
		allowDirectory: true,
		logLevel: 'info',
	});

	expect(entryPoint.file).toBe(
		path.resolve(process.cwd(), '..', 'example/src/index.ts'),
	);
	expect(entryPoint.remainingArgs).toEqual([]);
	expect(entryPoint.reason).toEqual('common paths');
});

test('Should use explicit entry point', () => {
	const entryPoint = findEntryPoint({
		args: ['src/ts-entry.tsx'],
		remotionRoot: path.resolve(process.cwd(), '..', 'example'),
		logLevel: 'info',
		allowDirectory: true,
	});

	expect(entryPoint.file).toBe(
		path.resolve(process.cwd(), '..', 'example/src/ts-entry.tsx'),
	);
	expect(entryPoint.remainingArgs).toEqual([]);
	expect(entryPoint.reason).toEqual('argument passed - found in root');
});

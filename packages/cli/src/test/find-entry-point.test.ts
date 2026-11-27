import {expect, test} from 'bun:test';
import path from 'node:path';
import {findEntryPoint} from '../entry-point';

test('Should accept URL as entry point', () => {
	const entryPoint = findEntryPoint({
		args: ['https://www.example.com'],
		remotionRoot: path.resolve(process.cwd(), '..', 'example'),
		logLevel: 'info',
		allowDirectory: true,
		firstArgCanBeCompositionId: true,
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
		firstArgCanBeCompositionId: true,
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
		firstArgCanBeCompositionId: true,
	});

	expect(entryPoint.file).toBe(
		path.resolve(process.cwd(), '..', 'example/src/ts-entry.tsx'),
	);
	expect(entryPoint.remainingArgs).toEqual([]);
	expect(entryPoint.reason).toEqual('argument passed - found in root');
});

test('Should not use a plain folder as entry point if the first argument can be a composition ID', () => {
	// `src` is a folder in both the CLI package (cwd) and the example project (Remotion root)
	const entryPoint = findEntryPoint({
		args: ['src'],
		remotionRoot: path.resolve(process.cwd(), '..', 'example'),
		logLevel: 'info',
		allowDirectory: true,
		firstArgCanBeCompositionId: true,
	});

	expect(entryPoint.file).toBe(
		path.resolve(process.cwd(), '..', 'example/src/index.ts'),
	);
	expect(entryPoint.remainingArgs).toEqual(['src']);
	expect(entryPoint.reason).toEqual('common paths');
});

test('Should not fall back to another entry point if the first argument can only be an entry point', () => {
	const entryPoint = findEntryPoint({
		args: ['src'],
		remotionRoot: path.resolve(process.cwd(), '..', 'example'),
		logLevel: 'info',
		allowDirectory: false,
		firstArgCanBeCompositionId: false,
	});

	expect(entryPoint.file).toBe(path.resolve(process.cwd(), 'src'));
	expect(entryPoint.remainingArgs).toEqual([]);
	expect(entryPoint.reason).toEqual('argument passed - found in cwd');
});

import {expect, test} from 'bun:test';
import {resolveFileSource} from '../error-overlay/react-overlay/effects/resolve-file-source';
import {makeBrowserStudioOperations} from './make-browser-studio-operations';

test('resolves file source using a GET request', async () => {
	const previousFetch = globalThis.fetch;
	const calls: {
		input: string | URL | Request;
		init: RequestInit | undefined;
	}[] = [];

	globalThis.fetch = ((input, init) => {
		calls.push({input, init});

		return Promise.resolve(
			new Response(['const a = 1;', 'const b = 2;', 'const c = 3;'].join('\n')),
		);
	}) as typeof fetch;

	try {
		const resolved = await resolveFileSource(
			{
				columnNumber: 3,
				fileName: '../rough-notation/dist/esm/index.mjs',
				lineNumber: 2,
				message: 'Example error',
			},
			1,
		);

		expect(calls).toHaveLength(1);
		expect(calls[0].input).toBe(
			'/api/file-source?f=..%2Frough-notation%2Fdist%2Fesm%2Findex.mjs',
		);
		expect(calls[0].init).toBeUndefined();
		expect(resolved.originalScriptCode).toEqual([
			{content: 'const a = 1;', highlight: false, lineNumber: 1},
			{content: 'const b = 2;', highlight: true, lineNumber: 2},
			{content: 'const c = 3;', highlight: false, lineNumber: 3},
		]);
	} finally {
		globalThis.fetch = previousFetch;
	}
});

test('resolves file source using a Browser Studio operation', async () => {
	const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
	const previousFetch = globalThis.fetch;
	let fetchCalled = false;
	const operations = makeBrowserStudioOperations({
		getFileSource: () => Promise.resolve('const fromBrowserStudio = true;'),
	});

	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: {remotion_browserStudio: operations},
	});
	globalThis.fetch = (() => {
		fetchCalled = true;
		throw new Error('fetch should not be called');
	}) as unknown as typeof fetch;

	try {
		const resolved = await resolveFileSource(
			{
				columnNumber: 1,
				fileName: 'webpack://remotion/./src/Composition.tsx',
				lineNumber: 1,
				message: 'Example error',
			},
			0,
		);

		expect(fetchCalled).toBe(false);
		expect(resolved.originalScriptCode).toEqual([
			{
				content: 'const fromBrowserStudio = true;',
				highlight: true,
				lineNumber: 1,
			},
		]);
	} finally {
		globalThis.fetch = previousFetch;
		if (previousWindow) {
			Object.defineProperty(globalThis, 'window', previousWindow);
		} else {
			Reflect.deleteProperty(globalThis, 'window');
		}
	}
});

test('does not fall back to the server when Browser Studio cannot find a file', async () => {
	const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
	const previousFetch = globalThis.fetch;
	let fetchCalled = false;
	const operations = makeBrowserStudioOperations({
		getFileSource: () => Promise.resolve(null),
	});

	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: {remotion_browserStudio: operations},
	});
	globalThis.fetch = (() => {
		fetchCalled = true;
		throw new Error('fetch should not be called');
	}) as unknown as typeof fetch;

	try {
		await expect(
			resolveFileSource(
				{
					columnNumber: 1,
					fileName: 'webpack://remotion/./src/missing.tsx',
					lineNumber: 1,
					message: 'Example error',
				},
				0,
			),
		).rejects.toThrow('Could not find webpack://remotion/./src/missing.tsx');
		expect(fetchCalled).toBe(false);
	} finally {
		globalThis.fetch = previousFetch;
		if (previousWindow) {
			Object.defineProperty(globalThis, 'window', previousWindow);
		} else {
			Reflect.deleteProperty(globalThis, 'window');
		}
	}
});

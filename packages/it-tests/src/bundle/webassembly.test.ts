import {expect, test} from 'bun:test';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {RenderInternals, openBrowser} from '@remotion/renderer';

// (module (func (export "answer") (result i32) i32.const 42))
const wasmModule = Uint8Array.from([
	0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x05, 0x01, 0x60, 0x00,
	0x01, 0x7f, 0x03, 0x02, 0x01, 0x00, 0x07, 0x0a, 0x01, 0x06, 0x61, 0x6e, 0x73,
	0x77, 0x65, 0x72, 0x00, 0x00, 0x0a, 0x06, 0x01, 0x04, 0x00, 0x41, 0x2a, 0x0b,
]);

const makeFixture = (entryPoint: string) => {
	const directory = mkdtempSync(path.join(tmpdir(), 'remotion-webassembly-'));
	writeFileSync(path.join(directory, 'answer.wasm'), wasmModule);
	writeFileSync(path.join(directory, 'index.ts'), entryPoint);
	return directory;
};

const readWasmResult = async ({
	browser,
	bundleDirectory,
	rootDirectory,
	pageIndex,
}: {
	browser: Awaited<ReturnType<typeof openBrowser>>;
	bundleDirectory: string;
	rootDirectory: string;
	pageIndex: number;
}) => {
	const browserLogs: string[] = [];
	const page = await browser.newPage({
		context: () => null,
		logLevel: 'error',
		indent: false,
		pageIndex,
		onBrowserLog: (log) => browserLogs.push(log.text),
		onLog: () => undefined,
	});
	const {port, close} = await RenderInternals.serveStatic(bundleDirectory, {
		port: null,
		offthreadVideoThreads: 1,
		downloadMap: RenderInternals.makeDownloadMap(48_000),
		indent: false,
		logLevel: 'error',
		offthreadVideoCacheSizeInBytes: null,
		remotionRoot: rootDirectory,
		binariesDirectory: null,
		forceIPv4: false,
	});

	try {
		await page.goto({
			url: `http://localhost:${port}`,
			timeout: 10_000,
			options: {},
		});

		for (let attempt = 0; attempt < 100; attempt++) {
			const handle = await page.evaluateHandle(() => {
				const state = globalThis as typeof globalThis & {
					__wasmError?: string;
					__wasmResult?: number;
				};
				return state.__wasmError ?? state.__wasmResult ?? null;
			});
			const value = String(handle.toString());
			await handle.dispose();

			if (value === '42') {
				return 42;
			}

			if (value !== 'null') {
				throw new Error(value);
			}

			await new Promise((resolve) => setTimeout(resolve, 50));
		}

		throw new Error(
			`WebAssembly did not execute. Browser logs:\n${browserLogs.join('\n')}`,
		);
	} finally {
		await close();
	}
};

test(
	'WebAssembly works asynchronously in Rspack and synchronously in a Webpack split point',
	async () => {
		const directories: string[] = [];
		const browser = await openBrowser('chrome');

		try {
			const rspackFixture = makeFixture(`
import {answer} from './answer.wasm';

(globalThis as typeof globalThis & {__wasmResult: number}).__wasmResult = answer();
`);
			directories.push(rspackFixture);
			const rspackBundle = await bundle({
				entryPoint: path.join(rspackFixture, 'index.ts'),
				rootDir: rspackFixture,
				rspack: true,
				ignoreRegisterRootWarning: true,
				enableCaching: false,
				bundlerOverride: (configuration) => ({
					...configuration,
					experiments: {
						...configuration.experiments,
						asyncWebAssembly: true,
					},
				}),
			});
			directories.push(rspackBundle);
			expect(
				await readWasmResult({
					browser,
					bundleDirectory: rspackBundle,
					rootDirectory: rspackFixture,
					pageIndex: 0,
				}),
			).toBe(42);

			const webpackFixture = makeFixture(`
void import('./answer.wasm')
  .then(({answer}) => {
    (globalThis as typeof globalThis & {__wasmResult: number}).__wasmResult = answer();
  })
  .catch((error) => {
    (globalThis as typeof globalThis & {__wasmError: string}).__wasmError = String(error);
  });
`);
			directories.push(webpackFixture);
			const webpackBundle = await bundle({
				entryPoint: path.join(webpackFixture, 'index.ts'),
				rootDir: webpackFixture,
				rspack: false,
				ignoreRegisterRootWarning: true,
				enableCaching: false,
				webpackOverride: (configuration) => ({
					...configuration,
					experiments: {
						...configuration.experiments,
						syncWebAssembly: true,
					},
				}),
			});
			directories.push(webpackBundle);
			expect(
				await readWasmResult({
					browser,
					bundleDirectory: webpackBundle,
					rootDirectory: webpackFixture,
					pageIndex: 1,
				}),
			).toBe(42);
		} finally {
			await browser.close({silent: false});
			for (const directory of directories) {
				rmSync(directory, {recursive: true, force: true});
			}
		}
	},
	{timeout: 60_000},
);

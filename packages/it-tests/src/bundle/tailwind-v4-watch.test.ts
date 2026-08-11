import {expect, test} from 'bun:test';
import {
	mkdirSync,
	mkdtempSync,
	realpathSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from 'node:fs';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {
	type BundlerConfiguration,
	type RspackConfiguration,
	type WebpackConfiguration,
	webpack,
} from '@remotion/bundler';
import {enableTailwind} from '@remotion/tailwind-v4';
import {rspack} from '@rspack/core';

type WatchOptions = NonNullable<BundlerConfiguration['watchOptions']>;
type Watcher = {
	close: (callback: (error?: Error) => void) => void;
};
type WatchCompiler = {
	watch: (
		options: WatchOptions,
		callback: (
			error: Error | null,
			stats?: {
				hasErrors: () => boolean;
				toString: (options: {all: boolean; errors: boolean}) => string;
			},
		) => void,
	) => Watcher;
	close: (callback: (error?: Error) => void) => void;
};

const require = createRequire(import.meta.url);
const tailwindRequire = createRequire(
	require.resolve('@remotion/tailwind-v4/package.json'),
);
const tailwindDirectory = path.dirname(
	tailwindRequire.resolve('tailwindcss/package.json'),
);

test('Tailwind watches source files but not the Remotion config', async () => {
	for (const bundler of ['webpack', 'rspack'] as const) {
		const fixtureDirectory = realpathSync(
			mkdtempSync(path.join(tmpdir(), `remotion-tailwind-${bundler}-`)),
		);
		const outputDirectory = mkdtempSync(
			path.join(tmpdir(), `remotion-tailwind-${bundler}-output-`),
		);
		const entryPoint = path.join(fixtureDirectory, 'index.js');
		const configFiles = [
			path.join(fixtureDirectory, 'remotion.config.ts'),
			path.join(fixtureDirectory, 'remotion.config.js'),
		];
		mkdirSync(path.join(fixtureDirectory, 'node_modules'));
		symlinkSync(
			tailwindDirectory,
			path.join(fixtureDirectory, 'node_modules', 'tailwindcss'),
			'dir',
		);
		writeFileSync(
			entryPoint,
			"import './style.css';\nexport const className = 'text-red-500';\n",
		);
		writeFileSync(
			path.join(fixtureDirectory, 'style.css'),
			'@import "tailwindcss" source("./");\n',
		);
		for (const configFile of configFiles) {
			writeFileSync(configFile, 'export const value = 1;\n');
		}

		const baseConfiguration = {
			context: fixtureDirectory,
			entry: entryPoint,
			mode: 'development',
			output: {
				path: outputDirectory,
				filename: 'bundle.js',
			},
		};
		const configuration = enableTailwind(
			baseConfiguration as WebpackConfiguration | RspackConfiguration,
		);
		const compiler = (
			bundler === 'webpack'
				? webpack(configuration as WebpackConfiguration)
				: rspack(configuration as RspackConfiguration)
		) as WatchCompiler;

		let buildCount = 0;
		let resolveNextBuild: (() => void) | null = null;
		let rejectNextBuild: ((error: Error) => void) | null = null;
		const waitForNextBuild = () =>
			new Promise<void>((resolve, reject) => {
				resolveNextBuild = resolve;
				rejectNextBuild = reject;
			});
		const initialBuild = waitForNextBuild();
		const watcher = compiler.watch(
			configuration.watchOptions ?? {},
			(error, stats) => {
				if (error) {
					rejectNextBuild?.(error);
					return;
				}

				if (stats?.hasErrors()) {
					rejectNextBuild?.(
						new Error(stats.toString({all: false, errors: true})),
					);
					return;
				}

				buildCount++;
				resolveNextBuild?.();
				resolveNextBuild = null;
				rejectNextBuild = null;
			},
		);

		try {
			await initialBuild;
			await new Promise((resolve) => setTimeout(resolve, 1_000));
			const buildCountBeforeConfigChange = buildCount;
			for (const configFile of configFiles) {
				writeFileSync(configFile, 'export const value = 2;\n');
				await new Promise((resolve) => setTimeout(resolve, 1_000));
				expect(buildCount).toBe(buildCountBeforeConfigChange);
			}

			const sourceBuild = waitForNextBuild();
			writeFileSync(
				path.join(fixtureDirectory, 'new-component.tsx'),
				"export const className = 'text-blue-500';\n",
			);
			await sourceBuild;
			expect(buildCount).toBe(buildCountBeforeConfigChange + 1);
		} finally {
			await new Promise<void>((resolve, reject) => {
				watcher.close((error) => (error ? reject(error) : resolve()));
			});
			await new Promise<void>((resolve, reject) => {
				compiler.close((error) => (error ? reject(error) : resolve()));
			});
			rmSync(fixtureDirectory, {recursive: true, force: true});
			rmSync(outputDirectory, {recursive: true, force: true});
		}
	}
}, 30_000);

import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createRspackCompiler, rspackConfig} from '../rspack-config';

test('emits a zero-delay Rspack React Refresh runtime', async () => {
	const outputDirectory = mkdtempSync(
		path.join(tmpdir(), 'remotion-rspack-refresh-'),
	);
	// The React Refresh runtime is injected for any user module, so compile a
	// single module instead of the whole Studio. That keeps the real Rspack config
	// and loader rule under test while compiling a fraction of the modules.
	const entry = path.join(outputDirectory, 'entry.tsx');
	writeFileSync(entry, 'export const Component = () => null;\n');
	const [, config] = await rspackConfig({
		entry: require.resolve('@remotion/studio/renderEntry'),
		userDefinedComponent: require.resolve('@remotion/studio/renderEntry'),
		outDir: outputDirectory,
		environment: 'development',
		bundlerOverride: (configuration) => configuration,
		rspackOverride: (configuration) => ({
			...configuration,
			entry,
			output: {
				...configuration.output,
				assetModuleFilename: '[hash][ext]',
			},
		}),
		onProgress: () => undefined,
		enableCaching: false,
		remotionRoot: process.cwd(),
		poll: null,
		extraPlugins: [],
	});
	const compiler = createRspackCompiler(config);

	try {
		await new Promise<void>((resolve, reject) => {
			compiler.run((error, stats) => {
				if (error) {
					reject(error);
					return;
				}

				if (stats?.hasErrors()) {
					reject(new Error(stats.toString({errors: true})));
					return;
				}

				resolve();
			});
		});

		const bundle = readFileSync(
			path.join(outputDirectory, 'bundle.js'),
			'utf8',
		);
		const refreshRuntimeStart = bundle.indexOf(
			'function createDebounceUpdate()',
		);
		const refreshRuntime = bundle.slice(
			refreshRuntimeStart,
			refreshRuntimeStart + 1500,
		);

		expect(refreshRuntimeStart).toBeGreaterThan(-1);
		expect(refreshRuntime).toContain('}, 0);');
		expect(refreshRuntime).not.toContain('}, 30);');
	} finally {
		await new Promise<void>((resolve) => compiler.close(() => resolve()));
		rmSync(outputDirectory, {recursive: true, force: true});
	}
	// A real Rspack compile, which takes several seconds on slow CI runners.
}, 30_000);

import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createRspackCompiler, rspackConfig} from '../rspack-config';

test('emits a zero-delay Rspack React Refresh runtime', async () => {
	const outputDirectory = mkdtempSync(
		path.join(tmpdir(), 'remotion-rspack-refresh-'),
	);
	const [, config] = await rspackConfig({
		entry: require.resolve('@remotion/studio/renderEntry'),
		userDefinedComponent: require.resolve('@remotion/studio/renderEntry'),
		outDir: outputDirectory,
		environment: 'development',
		bundlerOverride: (configuration) => configuration,
		rspackOverride: (configuration) => configuration,
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
});

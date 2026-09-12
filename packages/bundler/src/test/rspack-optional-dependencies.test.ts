import {expect, test} from 'bun:test';
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {bundle} from '../bundle';

test(
	'Rspack emits a bundle when optional Studio dependencies are missing',
	async () => {
		const fixtureDirectory = mkdtempSync(
			path.join(tmpdir(), 'remotion-rspack-optional-dependency-'),
		);
		const studioDirectory = path.join(
			fixtureDirectory,
			'node_modules',
			'@remotion',
			'studio',
		);
		const entryPoint = path.join(studioDirectory, 'entry.js');
		const outputDirectory = path.join(fixtureDirectory, 'build');
		mkdirSync(studioDirectory, {recursive: true});
		writeFileSync(
			entryPoint,
			"void import('@remotion/whisper-webgpu');\n",
			'utf8',
		);

		try {
			const output = await bundle({
				enableCaching: false,
				entryPoint,
				ignoreRegisterRootWarning: true,
				outDir: outputDirectory,
				rootDir: fixtureDirectory,
				rspack: true,
			});

			expect(output).toBe(outputDirectory);
			const bundlePath = path.join(output, 'bundle.js');
			expect(existsSync(bundlePath)).toBe(true);
			expect(readFileSync(bundlePath, 'utf8').length).toBeGreaterThan(0);
		} finally {
			rmSync(fixtureDirectory, {recursive: true, force: true});
		}
	},
	{timeout: 60_000},
);

test(
	'bundle fails if Rspack does not emit bundle.js',
	async () => {
		const fixtureDirectory = mkdtempSync(
			path.join(tmpdir(), 'remotion-rspack-missing-output-'),
		);
		const entryPoint = path.join(fixtureDirectory, 'entry.js');
		writeFileSync(entryPoint, 'globalThis.remotion_entry = true;\n', 'utf8');

		try {
			await expect(
				bundle({
					enableCaching: false,
					entryPoint,
					ignoreRegisterRootWarning: true,
					outDir: path.join(fixtureDirectory, 'build'),
					rootDir: fixtureDirectory,
					rspack: true,
					rspackOverride: (configuration) => ({
						...configuration,
						output: {
							...configuration.output,
							filename: 'unexpected.js',
						},
					}),
				}),
			).rejects.toThrow('The bundler completed without emitting bundle.js.');
		} finally {
			rmSync(fixtureDirectory, {recursive: true, force: true});
		}
	},
	{timeout: 60_000},
);

test(
	'Rspack still fails for missing user dependencies',
	async () => {
		const fixtureDirectory = mkdtempSync(
			path.join(tmpdir(), 'remotion-rspack-missing-user-dependency-'),
		);
		const entryPoint = path.join(fixtureDirectory, 'entry.js');
		writeFileSync(
			entryPoint,
			"import 'definitely-not-an-installed-package';\n",
			'utf8',
		);

		try {
			await expect(
				bundle({
					enableCaching: false,
					entryPoint,
					ignoreRegisterRootWarning: true,
					outDir: path.join(fixtureDirectory, 'build'),
					rootDir: fixtureDirectory,
					rspack: true,
				}),
			).rejects.toThrow('definitely-not-an-installed-package');
		} finally {
			rmSync(fixtureDirectory, {recursive: true, force: true});
		}
	},
	{timeout: 60_000},
);

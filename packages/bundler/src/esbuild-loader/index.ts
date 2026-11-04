import {readFileSync} from 'node:fs';
import path from 'node:path';
import {transform as defaultEsbuildTransform} from 'esbuild';
import type webpack from 'webpack';
import type {LoaderOptions} from './interfaces';

const isTsExtensionPtrn = /\.ts$/i;

async function ESBuildLoader(
	this: webpack.LoaderContext<LoaderOptions>,
	source: string,
): Promise<void> {
	const done = this.async();
	const options: LoaderOptions = this.getOptions();
	const {implementation, remotionRoot, ...esbuildTransformOptions} = options;

	const tsConfigPath = path.join(remotionRoot, 'tsconfig.json');

	if (implementation && typeof implementation.transform !== 'function') {
		done(
			new TypeError(
				`esbuild-loader: options.implementation.transform must be an ESBuild transform function. Received ${typeof implementation.transform}`,
			),
		);
		return;
	}

	const transform = implementation?.transform ?? defaultEsbuildTransform;

	const transformOptions = {
		...esbuildTransformOptions,
		target: options.target ?? 'es2015',
		loader: options.loader ?? 'js',
		sourcemap: this.sourceMap,
		sourcefile: this.resourcePath,
	};

	// https://github.com/privatenumber/esbuild-loader/pull/107
	if (
		transformOptions.loader === 'tsx' &&
		isTsExtensionPtrn.test(this.resourcePath)
	) {
		transformOptions.loader = 'ts';
	}

	try {
		if (!('tsconfigRaw' in transformOptions)) {
			try {
				transformOptions.tsconfigRaw = readFileSync(tsConfigPath, 'utf8');
			} catch (error) {
				if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
					throw error;
				}
			}
		}

		const {code, map} = await transform(source, transformOptions);
		done(null, code, map && JSON.parse(map));
	} catch (error: unknown) {
		done(error as Error);
	}
}

export default ESBuildLoader;

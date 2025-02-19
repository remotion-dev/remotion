import {transform as defaultEsbuildTransform} from 'esbuild';
import path from 'node:path';
import type webpack from 'webpack';
import type {LoaderOptions} from './interfaces';

const isTsExtensionPtrn = /\.ts$/i;

const isTypescriptInstalled = () => {
	try {
		require.resolve('typescript');
		return true;
	} catch {
		return false;
	}
};

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

	if (!('tsconfigRaw' in transformOptions) && isTypescriptInstalled()) {
		// eslint-disable-next-line @typescript-eslint/consistent-type-imports
		const typescript = require('typescript') as typeof import('typescript');
		const tsConfig = typescript.readConfigFile(
			tsConfigPath,
			typescript.sys.readFile,
		);

		transformOptions.tsconfigRaw = tsConfig.config;
	}

	// https://github.com/privatenumber/esbuild-loader/pull/107
	if (
		transformOptions.loader === 'tsx' &&
		isTsExtensionPtrn.test(this.resourcePath)
	) {
		transformOptions.loader = 'ts';
	}

	try {
		const {code, map} = await transform(source, transformOptions);
		done(null, code, map && JSON.parse(map));
	} catch (error: unknown) {
		done(error as Error);
	}
}

export default ESBuildLoader;

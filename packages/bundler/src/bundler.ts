import execa from 'execa';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {Internals, WebpackOverrideFn} from 'remotion';
import {promisify} from 'util';
import webpack from 'webpack';
import {webpackConfig} from './webpack-config';

const entry = require.resolve('./renderEntry');

const promisified = promisify(webpack);

const prepareOutDir = async (specified: string | null) => {
	if (specified) {
		await fs.promises.mkdir(specified, {recursive: true});
		return specified;
	}
	return fs.promises.mkdtemp(path.join(os.tmpdir(), 'react-motion-graphics'));
};

export const bundle = async (
	entryPoint: string,
	onProgressUpdate?: (progress: number) => void,
	options?: {
		webpackOverride?: WebpackOverrideFn;
		outDir?: string;
		enableCaching?: boolean;
	}
): Promise<string> => {
	const outDir = await prepareOutDir(options?.outDir ?? null);
	const output = await promisified([
		webpackConfig({
			entry,
			userDefinedComponent: entryPoint,
			outDir,
			environment: 'production',
			webpackOverride:
				options?.webpackOverride ?? Internals.getWebpackOverrideFn(),
			onProgressUpdate,
			enableCaching:
				options?.enableCaching ?? Internals.DEFAULT_WEBPACK_CACHE_ENABLED,
		}),
	]);
	if (!output) {
		throw new Error('Expected webpack output');
	}
	const {errors} = output.toJson();
	if (errors !== undefined && errors.length > 0) {
		throw new Error(errors[0].message + '\n' + errors[0].details);
	}
	const indexHtmlDir = path.join(__dirname, '..', 'web', 'index.html');
	if (process.platform === 'win32') {
		await execa('copy', [indexHtmlDir, outDir]);
	} else {
		await execa('cp', [indexHtmlDir, outDir]);
	}
	return outDir;
};

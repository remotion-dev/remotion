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

export const bundle = async (
	entryPoint: string,
	onProgressUpdate?: (f: number) => void,
	options?: {
		webpackOverride?: WebpackOverrideFn;
	}
): Promise<string> => {
	const tmpDir = await fs.promises.mkdtemp(
		path.join(os.tmpdir(), 'react-motion-graphics')
	);
	const output = await promisified([
		webpackConfig({
			entry,
			userDefinedComponent: entryPoint,
			outDir: tmpDir,
			environment: 'production',
			webpackOverride:
				options?.webpackOverride ?? Internals.getWebpackOverrideFn(),
			onProgressUpdate,
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
		await execa('copy', [indexHtmlDir, tmpDir]);
	} else {
		await execa('cp', [indexHtmlDir, tmpDir]);
	}
	return tmpDir;
};

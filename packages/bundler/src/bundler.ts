import execa from 'execa';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {promisify} from 'util';
import webpack from 'webpack';
import {webpackConfig} from './webpack-config';

const entry = require.resolve('./renderEntry');

const promisified = promisify(webpack);

export const bundle = async (entryPoint: string): Promise<string> => {
	const tmpDir = await fs.promises.mkdtemp(
		path.join(os.tmpdir(), 'react-motion-graphics')
	);
	const output = await promisified([
		webpackConfig({
			entry,
			userDefinedComponent: entryPoint,
			outDir: tmpDir,
			environment: 'production',
		}),
	]);
	if (!output) {
		throw new Error('Expected webpack output');
	}
	const {errors} = output.toJson();
	if (errors.length > 0) {
		throw new Error(errors[0].message + '\n' + errors[0].details);
	}
	await execa(process.platform === 'win32' ? 'copy' : 'cp', [path.join(__dirname, '..', 'web', 'index.html'), tmpDir]);
	return tmpDir;
};

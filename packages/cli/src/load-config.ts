import {BundlerInternals} from '@remotion/bundler';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {isMainThread} from 'worker_threads';
import {Log} from './log';

export const loadConfigFile = async (
	remotionRoot: string,
	configFileName: string,
	isJavascript: boolean
): Promise<string | null> => {
	const resolved = path.resolve(remotionRoot, configFileName);

	const tsconfigJson = path.join(remotionRoot, 'tsconfig.json');
	if (!isJavascript && !fs.existsSync(tsconfigJson)) {
		Log.error(
			'Could not find a tsconfig.json file in your project. Did you delete it? Create a tsconfig.json in the root of your project. Copy the default file from https://github.com/remotion-dev/template-helloworld/blob/main/tsconfig.json.'
		);
		Log.error('The root directory is:', remotionRoot);
		process.exit(1);
	}

	const out = path.join(
		await fs.promises.mkdtemp(path.join(os.tmpdir(), 'remotion-')),
		'bundle.js'
	);
	const result = await BundlerInternals.esbuild.build({
		platform: 'node',
		target: 'node14',
		bundle: true,
		entryPoints: [resolved],
		tsconfig: isJavascript ? undefined : tsconfigJson,
		absWorkingDir: remotionRoot,
		outfile: out,
		external: [
			'remotion',
			// Dependencies of babel-loader that trigger a warning when used
			'react-refresh/babel',
			'@babel/plugin-proposal-class-properties',
			'@babel/preset-typescript',
			'@babel/preset-react',
			'babel-loader',
			'@babel/preset-env',
		],
	});
	if (result.errors.length > 0) {
		Log.error('Error in remotion.config.ts file');
		for (const err in result.errors) {
			Log.error(err);
		}

		process.exit(1);
	}

	const file = await fs.promises.readFile(out, 'utf8');

	const currentCwd = process.cwd();

	// The config file is always executed from the Remotion root, if `process.cwd()` is being used. We cannot enforce this in worker threads used for testing
	if (isMainThread) {
		process.chdir(remotionRoot);
	}

	// Exectute the contents of the config file
	// eslint-disable-next-line no-eval
	eval(file);

	if (isMainThread) {
		process.chdir(currentCwd);
	}

	await fs.promises.unlink(out);
	return resolved;
};

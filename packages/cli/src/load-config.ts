import fs from 'node:fs';
import path from 'node:path';
import {isMainThread} from 'node:worker_threads';
import {BundlerInternals} from '@remotion/bundler';

export type PreparedConfigFile = {
	code: string;
	remotionRoot: string;
	resolved: string;
};

export const prepareConfigFile = async (
	remotionRoot: string,
	configFileName: string,
	isJavascript: boolean,
): Promise<PreparedConfigFile> => {
	const resolved = path.resolve(remotionRoot, configFileName);

	const tsconfigJson = path.join(remotionRoot, 'tsconfig.json');
	if (!isJavascript && !fs.existsSync(tsconfigJson)) {
		throw new Error(
			`Could not find a tsconfig.json file in your project. Did you delete it? Create a tsconfig.json in the root of your project. Copy the default file from https://github.com/remotion-dev/template-helloworld/blob/main/tsconfig.json. The root directory is: ${remotionRoot}`,
		);
	}

	const virtualOutfile = 'bundle.js';
	const result = await BundlerInternals.esbuild.build({
		platform: 'node',
		target: 'node16',
		bundle: true,
		entryPoints: [resolved],
		tsconfig: isJavascript ? undefined : tsconfigJson,
		absWorkingDir: remotionRoot,
		outfile: virtualOutfile,
		write: false,
		packages: 'external',
	});
	if (result.errors.length > 0) {
		throw new Error(
			`Error in remotion.config.ts file: ${result.errors
				.map((error) => error.text)
				.join('\n')}`,
		);
	}

	const firstOutfile = result.outputFiles[0];

	if (!firstOutfile) {
		throw new Error('No output files found in the config file.');
	}

	const code = new TextDecoder().decode(firstOutfile.contents);
	return {code, remotionRoot, resolved};
};

export const executeConfigFile = ({code, remotionRoot}: PreparedConfigFile) => {
	let str = code;

	const currentCwd = process.cwd();

	// The config file is always executed from the Remotion root, if `process.cwd()` is being used. We cannot enforce this in worker threads used for testing
	if (isMainThread) {
		process.chdir(remotionRoot);
	}

	if (process.env.PATCH_BUN_DEVELOPMENT) {
		str = str.replace('@remotion/cli/config', './config');
	}

	try {
		// Execute the contents of the config file
		// eslint-disable-next-line no-eval
		eval(str);
	} finally {
		if (isMainThread) {
			process.chdir(currentCwd);
		}
	}
};

export const loadConfigFile = async (
	remotionRoot: string,
	configFileName: string,
	isJavascript: boolean,
): Promise<PreparedConfigFile> => {
	const prepared = await prepareConfigFile(
		remotionRoot,
		configFileName,
		isJavascript,
	);
	executeConfigFile(prepared);
	return prepared;
};

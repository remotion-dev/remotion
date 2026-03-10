import fs from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import {isMainThread} from 'node:worker_threads';
import {BundlerInternals} from '@remotion/bundler';
import {failOrThrow, type ExitBehavior} from './exit-behavior';
import {Log} from './log';

const replaceConfigImport = (code: string, replacement: string): string => {
	return code
		.split("'@remotion/cli/config'")
		.join(JSON.stringify(replacement))
		.split('"@remotion/cli/config"')
		.join(JSON.stringify(replacement));
};

const executeConfigBundle = ({
	code,
	fullPath,
	remotionRoot,
}: {
	code: string;
	fullPath: string;
	remotionRoot: string;
}) => {
	const currentCwd = process.cwd();

	// The config file is always executed from the Remotion root, if
	// `process.cwd()` is being used. We cannot enforce this in worker threads
	// used for testing.
	if (isMainThread) {
		process.chdir(remotionRoot);
	}

	const requireFromConfig = createRequire(fullPath);
	const configModule = {
		exports: {},
	};

	try {
		// Execute the bundle as if it was the config file itself so external
		// imports resolve from the user's project instead of the CLI package.
		// eslint-disable-next-line no-new-func
		const evaluator = new Function(
			'require',
			'module',
			'exports',
			'__filename',
			'__dirname',
			code,
		);
		evaluator(
			requireFromConfig,
			configModule,
			configModule.exports,
			fullPath,
			path.dirname(fullPath),
		);
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
	exitBehavior: ExitBehavior = 'process-exit',
): Promise<string | null> => {
	const resolved = path.resolve(remotionRoot, configFileName);

	const tsconfigJson = path.join(remotionRoot, 'tsconfig.json');
	if (!isJavascript && !fs.existsSync(tsconfigJson)) {
		Log.error(
			{indent: false, logLevel: 'error'},
			'Could not find a tsconfig.json file in your project. Did you delete it? Create a tsconfig.json in the root of your project. Copy the default file from https://github.com/remotion-dev/template-helloworld/blob/main/tsconfig.json.',
		);
		Log.error(
			{indent: false, logLevel: 'error'},
			'The root directory is:',
			remotionRoot,
		);
		return failOrThrow({
			behavior: exitBehavior,
			code: 1,
			error: new Error(
				'Could not find a tsconfig.json file in your project. Create a tsconfig.json in the project root.',
			),
		});
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
		Log.error(
			{indent: false, logLevel: 'error'},
			'Error in remotion.config.ts file',
		);
		for (const err in result.errors) {
			Log.error({indent: false, logLevel: 'error'}, err);
		}

		return failOrThrow({
			behavior: exitBehavior,
			code: 1,
			error: new Error('Error in remotion.config.ts file.'),
		});
	}

	const firstOutfile = result.outputFiles[0];

	if (!firstOutfile) {
		Log.error(
			{indent: false, logLevel: 'error'},
			'No output files found in the config file.',
		);
		return failOrThrow({
			behavior: exitBehavior,
			code: 1,
			error: new Error('No output files found in the config file.'),
		});
	}

	let str = new TextDecoder().decode(firstOutfile.contents);
	const configModulePath = require.resolve('./config');
	str = replaceConfigImport(str, configModulePath);

	executeConfigBundle({
		code: str,
		fullPath: resolved,
		remotionRoot,
	});

	return resolved;
};

import fs from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import {isMainThread} from 'node:worker_threads';
import {BundlerInternals} from '@remotion/bundler';

const defaultConfigFileJavascript = 'remotion.config.js';
const defaultConfigFileTypescript = 'remotion.config.ts';

const resolveConfigFile = (
	remotionRoot: string,
	configFile: string | null,
): {fullPath: string; isJavascript: boolean} | null => {
	if (configFile) {
		const fullPath = path.resolve(remotionRoot, configFile);
		if (!fs.existsSync(fullPath)) {
			throw new Error(
				`You specified a config file location of "${configFile}" but no file under ${fullPath} was found.`,
			);
		}

		return {
			fullPath,
			isJavascript: fullPath.endsWith('.js'),
		};
	}

	const tsPath = path.resolve(remotionRoot, defaultConfigFileTypescript);
	if (fs.existsSync(tsPath)) {
		return {
			fullPath: tsPath,
			isJavascript: false,
		};
	}

	const jsPath = path.resolve(remotionRoot, defaultConfigFileJavascript);
	if (fs.existsSync(jsPath)) {
		return {
			fullPath: jsPath,
			isJavascript: true,
		};
	}

	return null;
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
	if (isMainThread) {
		process.chdir(remotionRoot);
	}

	const requireFromConfig = createRequire(fullPath);
	const configModule = {
		exports: {},
	};

	try {
		// Execute the bundle as if it was the config file itself so external
		// imports resolve from the user's project instead of this package.
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

export const loadConfig = async ({
	remotionRoot,
	configFile = null,
}: {
	remotionRoot: string;
	configFile?: string | null;
}): Promise<string | null> => {
	const resolvedConfig = resolveConfigFile(remotionRoot, configFile);
	if (resolvedConfig === null) {
		return null;
	}

	const {fullPath, isJavascript} = resolvedConfig;
	const tsconfigJson = path.join(remotionRoot, 'tsconfig.json');
	if (!isJavascript && !fs.existsSync(tsconfigJson)) {
		throw new Error(
			'Could not find a tsconfig.json file in your project. Create a tsconfig.json in the project root.',
		);
	}

	const result = await BundlerInternals.esbuild.build({
		platform: 'node',
		target: 'node16',
		bundle: true,
		entryPoints: [fullPath],
		tsconfig: isJavascript ? undefined : tsconfigJson,
		absWorkingDir: remotionRoot,
		outfile: 'bundle.js',
		write: false,
		packages: 'external',
	});

	if (result.errors.length > 0) {
		const [firstError] = result.errors;
		throw new Error(firstError?.text ?? 'Error in remotion.config.ts file.');
	}

	const firstOutfile = result.outputFiles[0];
	if (!firstOutfile) {
		throw new Error('No output files found in the config file.');
	}

	let code = new TextDecoder().decode(firstOutfile.contents);
	const configModulePath = require.resolve('./config');
	code = code
		.replaceAll("'@remotion/cli/config'", JSON.stringify(configModulePath))
		.replaceAll('"@remotion/cli/config"', JSON.stringify(configModulePath));

	executeConfigBundle({
		code,
		fullPath,
		remotionRoot,
	});

	return fullPath;
};

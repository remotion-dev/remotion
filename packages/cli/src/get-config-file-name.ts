import {existsSync} from 'node:fs';
import path from 'node:path';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {ConfigInternals} from './config';
import {
	executeConfigFile,
	loadConfigFile,
	prepareConfigFile,
} from './load-config';
import type {PreparedConfigFile} from './load-config';
import {Log} from './log';
import {parsedCli} from './parsed-cli';

const {configOption, logLevelOption, rspackOption} = BrowserSafeApis.options;

const defaultConfigFileJavascript = 'remotion.config.js';
const defaultConfigFileTypescript = 'remotion.config.ts';
let loadedConfigFile: PreparedConfigFile | null = null;

export const getLoadedConfigFile = () => loadedConfigFile?.resolved ?? null;
export const getLoadedConfigFileCode = () => loadedConfigFile?.code ?? null;

const warnAboutBundlerOverride = () => {
	const useRspack = rspackOption.getValue({commandLine: parsedCli}).value;
	const hasWebpackOverride =
		ConfigInternals.getWebpackOverrideFn() !==
		ConfigInternals.defaultOverrideFunction;
	const hasRspackOverride =
		ConfigInternals.getRspackOverrideFn() !==
		ConfigInternals.defaultRspackOverrideFunction;

	if (
		(useRspack && !hasWebpackOverride) ||
		(!useRspack && !hasRspackOverride)
	) {
		return;
	}

	const selectedBundler = useRspack ? 'Rspack' : 'Webpack';
	const ignoredBundler = useRspack ? 'Webpack' : 'Rspack';
	const selectedOverride = useRspack
		? 'overrideRspackConfig'
		: 'overrideWebpackConfig';
	const ignoredOverride = useRspack
		? 'overrideWebpackConfig'
		: 'overrideRspackConfig';
	const logLevel = logLevelOption.getValue({commandLine: parsedCli}).value;

	Log.warn(
		{indent: false, logLevel},
		`You have selected ${selectedBundler} as the bundler, but Config.${ignoredOverride}() was called. The ${ignoredBundler} override will be ignored. Use Config.${selectedOverride}() or Config.overrideBundlerConfig() instead.`,
	);
};

const loadInitialConfigFile = async (
	remotionRoot: string,
	configFileName: string,
	isJavascript: boolean,
) => {
	try {
		const config = await loadConfigFile(
			remotionRoot,
			configFileName,
			isJavascript,
		);
		warnAboutBundlerOverride();
		return config;
	} catch (error) {
		Log.error(
			{indent: false, logLevel: 'error'},
			error instanceof Error ? error.message : String(error),
		);
		process.exit(1);
	}
};

export const loadConfig = async (
	remotionRoot: string,
): Promise<string | null> => {
	const configFile = configOption.getValue({commandLine: parsedCli}).value;
	if (configFile) {
		const fullPath = path.resolve(process.cwd(), configFile);
		if (!existsSync(fullPath)) {
			Log.error(
				{indent: false, logLevel: 'error'},
				`You specified a config file location of "${configFile}" but no file under ${fullPath} was found.`,
			);
			process.exit(1);
		}

		loadedConfigFile = await loadInitialConfigFile(
			remotionRoot,
			configFile,
			fullPath.endsWith('.js'),
		);
		return loadedConfigFile.resolved;
	}

	if (remotionRoot === null) {
		loadedConfigFile = null;
		return null;
	}

	if (existsSync(path.resolve(remotionRoot, defaultConfigFileTypescript))) {
		loadedConfigFile = await loadInitialConfigFile(
			remotionRoot,
			defaultConfigFileTypescript,
			false,
		);
		return loadedConfigFile.resolved;
	}

	if (existsSync(path.resolve(remotionRoot, defaultConfigFileJavascript))) {
		loadedConfigFile = await loadInitialConfigFile(
			remotionRoot,
			defaultConfigFileJavascript,
			true,
		);
		return loadedConfigFile.resolved;
	}

	loadedConfigFile = null;
	return null;
};

type ReloadConfigResult<T> =
	| {type: 'success'; value: T}
	| {type: 'error'; errorMessage: string}
	| {type: 'no-config'};

const logConfigReloadError = (errorMessage: string) => {
	Log.error(
		{indent: false, logLevel: 'error'},
		'Could not reload the Remotion config. Keeping the previous configuration.',
		errorMessage,
	);
};

export const reloadConfig = async <T>({
	resetConfigOptions,
	getConfigSnapshot,
}: {
	resetConfigOptions: () => void;
	getConfigSnapshot: (configFileCode: string) => T | Promise<T>;
}): Promise<ReloadConfigResult<T>> => {
	if (!loadedConfigFile) {
		return {type: 'no-config'};
	}

	const previousConfigFile = loadedConfigFile;
	let nextConfigFile: PreparedConfigFile;

	try {
		nextConfigFile = await prepareConfigFile(
			previousConfigFile.remotionRoot,
			previousConfigFile.resolved,
			previousConfigFile.resolved.endsWith('.js'),
		);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		logConfigReloadError(errorMessage);
		return {type: 'error', errorMessage};
	}

	resetConfigOptions();
	try {
		executeConfigFile(nextConfigFile);
		const configSnapshot = await getConfigSnapshot(nextConfigFile.code);
		warnAboutBundlerOverride();
		loadedConfigFile = nextConfigFile;
		return {type: 'success', value: configSnapshot};
	} catch (error) {
		resetConfigOptions();
		executeConfigFile(previousConfigFile);
		const errorMessage = error instanceof Error ? error.message : String(error);
		logConfigReloadError(errorMessage);
		return {type: 'error', errorMessage};
	}
};

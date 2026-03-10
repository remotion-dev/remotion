import fs, {readFileSync} from 'node:fs';
import path from 'node:path';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import dotenv from 'dotenv';
import {ConfigInternals} from './config';
import {installFileWatcher} from './file-watcher';

function getProcessEnv(): Record<string, string> {
	const env: Record<string, string> = {};

	for (const key of Object.keys(process.env)) {
		if (key.startsWith('REMOTION_')) {
			env[key] = process.env[key] as string;
		}
	}

	return env;
}

const watchEnvFile = ({
	processEnv,
	envFile,
	onUpdate,
	logLevel,
}: {
	processEnv: Record<string, string>;
	envFile: string;
	onUpdate: (newProps: Record<string, string>) => void;
	logLevel: LogLevel;
}): (() => void) => {
	const updateFile = async () => {
		const file = await fs.promises.readFile(envFile, 'utf-8');
		onUpdate({
			...processEnv,
			...dotenv.parse(file),
		});
	};

	const {unwatch} = installFileWatcher({
		file: envFile,
		onChange: async (type) => {
			try {
				if (type === 'deleted') {
					RenderInternals.Log.warn(
						{indent: false, logLevel},
						`${envFile} was deleted.`,
					);
					return;
				}

				await updateFile();
				RenderInternals.Log.info(
					{indent: false, logLevel},
					`${type === 'created' ? 'Created' : 'Updated'} env file ${envFile}`,
				);
			} catch (err) {
				RenderInternals.Log.error(
					{indent: false, logLevel},
					`${envFile} update failed with error ${(err as Error).stack}`,
				);
			}
		},
	});

	return unwatch;
};

const getEnvForFile = ({
	processEnv,
	envFile,
	onUpdate,
	logLevel,
}: {
	processEnv: Record<string, string>;
	envFile: string;
	onUpdate: null | ((newProps: Record<string, string>) => void);
	logLevel: LogLevel;
}): Record<string, string> => {
	try {
		const envFileData = readFileSync(envFile);
		if (onUpdate) {
			watchEnvFile({processEnv, envFile, onUpdate, logLevel});
		}

		return {
			...processEnv,
			...dotenv.parse(envFileData),
		};
	} catch {
		throw new Error(`Your .env file at ${envFile} could not be parsed.`);
	}
};

const findDotEnvFile = (
	remotionRoot: string,
): {found: string | null; defaultEnvFile: string} => {
	const defaultEnvFile = path.resolve(remotionRoot, '.env');
	const paths = [defaultEnvFile, path.resolve(remotionRoot, '.env.local')];

	for (const candidate of paths) {
		if (fs.existsSync(candidate)) {
			return {found: candidate, defaultEnvFile};
		}
	}

	return {found: null, defaultEnvFile};
};

export const getEnvironmentVariables = ({
	onUpdate,
	logLevel,
	remotionRoot,
}: {
	onUpdate: null | ((newProps: Record<string, string>) => void);
	logLevel: LogLevel;
	remotionRoot: string;
}): Record<string, string> => {
	const processEnv = getProcessEnv();
	const configuredEnvFile = ConfigInternals.getDotEnvLocation();

	if (configuredEnvFile) {
		const envFile = path.resolve(remotionRoot, configuredEnvFile);
		if (!fs.existsSync(envFile)) {
			throw new Error(
				`The env file could not be found at ${envFile}. Check that your path is correct and try again.`,
			);
		}

		return getEnvForFile({
			processEnv,
			envFile,
			onUpdate,
			logLevel,
		});
	}

	const {defaultEnvFile, found} = findDotEnvFile(remotionRoot);
	if (!found) {
		if (onUpdate) {
			watchEnvFile({
				processEnv,
				envFile: defaultEnvFile,
				onUpdate,
				logLevel,
			});
		}

		return processEnv;
	}

	return getEnvForFile({
		processEnv,
		envFile: found,
		onUpdate,
		logLevel,
	});
};

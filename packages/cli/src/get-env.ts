import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import {ConfigInternals} from './config';
import {findRemotionRoot} from './find-closest-package-json';
import {Log} from './log';
import {parsedCli} from './parse-command-line';

function getProcessEnv(): Record<string, string> {
	const env: Record<string, string> = {};

	const validKeys = Object.keys(process.env).filter((key) =>
		key.startsWith('REMOTION_')
	);

	for (const key of validKeys) {
		env[key] = process.env[key] as string;
	}

	return env;
}

const getEnvForEnvFile = async (
	processEnv: ReturnType<typeof getProcessEnv>,
	envFile: string,
	onUpdate: (newProps: Record<string, string>) => void
) => {
	try {
		const envFileData = await fs.promises.readFile(envFile);
		fs.watchFile(envFile, {interval: 100}, async () => {
			try {
				const file = await fs.promises.readFile(envFile, 'utf-8')
				onUpdate({
					...processEnv,
					...dotenv.parse(file),
				});
				Log.info(`Updated env file ${envFile}.`);
			} catch (err) {
				Log.error(
					`${envFile} update fails with error ${err}`
				);
			}
		});
		return {
			...processEnv,
			...dotenv.parse(envFileData),
		};
	} catch (err) {
		Log.error(`Your .env file at ${envFile} could not not be parsed.`);
		Log.error(err);
		process.exit(1);
	}
};

export const getEnvironmentVariables = (onUpdate: (newProps: Record<string, string>) => void): Promise<Record<string, string>> => {
	const processEnv = getProcessEnv();

	if (parsedCli['env-file']) {
		const envFile = path.resolve(process.cwd(), parsedCli['env-file']);
		if (!fs.existsSync(envFile)) {
			Log.error('You passed a --env-file but it could not be found.');
			Log.error('We looked for the file at:', envFile);
			Log.error('Check that your path is correct and try again.');
			process.exit(1);
		}

		return getEnvForEnvFile(processEnv, envFile, onUpdate);
	}

	const remotionRoot = findRemotionRoot();

	const configFileSetting = ConfigInternals.getDotEnvLocation();
	if (configFileSetting) {
		const envFile = path.resolve(remotionRoot, configFileSetting);
		if (!fs.existsSync(envFile)) {
			Log.error(
				'You specified a custom .env file using `Config.Rendering.setDotEnvLocation()` in the config file but it could not be found'
			);
			Log.error('We looked for the file at:', envFile);
			Log.error('Check that your path is correct and try again.');
			process.exit(1);
		}

		return getEnvForEnvFile(processEnv, envFile, onUpdate);
	}

	const defaultEnvFile = path.resolve(remotionRoot, '.env');
	if (!fs.existsSync(defaultEnvFile)) {
		return Promise.resolve(processEnv);
	}

	return getEnvForEnvFile(processEnv, defaultEnvFile, onUpdate);
};

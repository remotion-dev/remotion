import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
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

export const getEnvironmentVariables = async (): Promise<
	Record<string, string>
> => {
	const processEnv = getProcessEnv();

	const envFile = path.resolve(process.cwd(), parsedCli['env-file'] ?? '.env');
	if (parsedCli['env-file'] && !fs.existsSync(envFile)) {
		Log.error(
			'You passed --env-file but it was not a file path to a valid environment file.'
		);
		Log.info('We looked for the file at:', envFile);
		Log.error('Check that your path is correct and try again.');
		process.exit(1);
	}

	if (!fs.existsSync(envFile)) {
		return processEnv;
	}

	try {
		const envFileData = await fs.promises.readFile(envFile);
		return {
			...processEnv,
			...dotenv.parse(envFileData),
		};
	} catch (err) {
		Log.error(`Your .env file at ${envFile} could not not be parsed.`);
		process.exit(1);
	}
};

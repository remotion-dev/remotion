import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import {Log} from './log';
import {parsedCli} from './parse-command-line';

function getProcessEnv(): object {
    const env: Record<string, string> = {};

    const validKeys = Object.keys(process.env).filter(key => key.startsWith("REMOTION_"));

    for (const key of validKeys) {
        env[key] = process.env[key] as string;
    }

    return env;
}

export const getEnv = (): object => {
    const processEnv = getProcessEnv();

    if (!parsedCli['env-file']) {
        return processEnv;
    }

    const envFile = path.resolve(process.cwd(), parsedCli['env-file']);

    try {
        if (fs.existsSync(envFile)) {
            const envFileData = fs.readFileSync(envFile);
            return {
                ...processEnv,
                ...dotenv.parse(envFileData),
            };
        }
    } catch (err) {
        // fall through
    }

    Log.error(
        'You passed --env-file but it was not a file path to a valid environment file.'
    );
    Log.info('Got the following value:', parsedCli['env-file']);
    Log.error(
        'Check that your input is parseable using `dotenv` and try again.'
    );
    process.exit(1);
};
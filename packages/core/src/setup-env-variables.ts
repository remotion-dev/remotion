import {getRemotionEnvironment} from './get-environment.js';

const getEnvVariables = (): Record<string, string> => {
	if (getRemotionEnvironment() === 'rendering') {
		const param = window.remotion_envVariables;
		if (!param) {
			return {};
		}

		return {...JSON.parse(param), NODE_ENV: process.env.NODE_ENV};
	}

	if (getRemotionEnvironment() === 'preview') {
		// For the Preview, we already set the environment variables in index-html.ts.
		// We just add NODE_ENV here.
		return {
			NODE_ENV: 'development',
		};
	}

	throw new Error(
		'Can only call getEnvVariables() if environment is `rendering` or `preview`'
	);
};

export const setupEnvVariables = () => {
	const env = getEnvVariables();
	if (!window.process) {
		window.process = {} as NodeJS.Process;
	}

	if (!window.process.env) {
		window.process.env = {};
	}

	Object.keys(env).forEach((key) => {
		window.process.env[key] = env[key];
	});
};

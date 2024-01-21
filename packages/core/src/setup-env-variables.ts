import {getRemotionEnvironment} from './get-remotion-environment.js';

const getEnvVariables = (): Record<string, string> => {
	if (getRemotionEnvironment().isRendering) {
		const param = window.remotion_envVariables;
		if (!param) {
			return {};
		}

		return {...JSON.parse(param), NODE_ENV: process.env.NODE_ENV};
	}

	// For the Studio, we already set the environment variables in index-html.ts.
	// We just add NODE_ENV here.
	if (!process.env.NODE_ENV) {
		throw new Error('process.env.NODE_ENV is not set');
	}

	return {
		NODE_ENV: process.env.NODE_ENV,
	};
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

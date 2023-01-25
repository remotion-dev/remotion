import {getRemotionEnvironment} from './get-environment';

export const ENV_VARIABLES_ENV_NAME = 'ENV_VARIABLES' as const;

const getEnvVariables = (): Record<string, string> => {
	if (getRemotionEnvironment() === 'rendering') {
		const param = window.remotion_envVariables;
		if (!param) {
			return {};
		}

		return {...JSON.parse(param), NODE_ENV: process.env.NODE_ENV};
	}

	if (getRemotionEnvironment() === 'preview') {
		// Webpack will convert this to an object at compile time.
		// Don't convert this syntax to a computed property.
		return {
			...(process.env.ENV_VARIABLES as unknown as Record<string, string>),
			NODE_ENV: process.env.NODE_ENV as string,
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

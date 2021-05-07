export const ENV_VARIABLES_LOCAL_STORAGE_KEY = 'remotion.envVariables';
export const ENV_VARIABLES_ENV_NAME = 'ENV_VARIABLES' as const;

const getEnvVariables = (): Record<string, string> => {
	if (process.env.NODE_ENV === 'production') {
		const param = localStorage.getItem(ENV_VARIABLES_LOCAL_STORAGE_KEY);
		if (!param) {
			return {};
		}

		return {...JSON.parse(param), NODE_ENV: 'production'};
	}

	// Webpack will convert this to an object at compile time.
	// Don't convert this syntax to a computed property.
	return {
		...((process.env.ENV_VARIABLES as unknown) as Record<string, string>),
		NODE_ENV: 'development',
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

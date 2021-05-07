export const ENV_VARIABLES_LOCAL_STORAGE_KEY = 'remotion.envVariables';
export const ENV_VARIABLES_ENV_NAME = 'ENV_VARIABLES';

const getEnvVariables = (): Record<string, string> => {
	if (process.env.NODE_ENV === 'production') {
		const param = localStorage.getItem(ENV_VARIABLES_LOCAL_STORAGE_KEY);
		if (!param) {
			return {};
		}

		return JSON.parse(param);
	}
	return (process.env[ENV_VARIABLES_ENV_NAME] as unknown) as Record<
		string,
		string
	>;
};

export const setupEnvVariables = () => {
	const env = getEnvVariables();
	if (!window.process) {
		window.process = {} as NodeJS.Process;
	}
	if (!window.process.env) {
		window.process.env = {};
	}
	Object.keys(env).map((key) => {
		window.process.env[key] = env[key];
	});
};

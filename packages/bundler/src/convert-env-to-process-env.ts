export const convertEnvToProcessEnv = (obj: {[key: string]: string}) => {
	const keyValuePair = Object.keys(obj).map((key) => [
		`process.env.${key}`,
		obj[key],
	]);
	return keyValuePair.reduce((keyValues, entry) => {
		return {
			...keyValues,
			[entry[0]]: entry[1],
		};
	}, {});
};

export const envVariablesObjectToArray = (
	envVariables: Record<string, string>
): [string, string][] => {
	return Object.entries(envVariables).map(([key, one]) => [
		key.trim(),
		one.trim(),
	]);
};

export const envVariablesArrayToObject = (
	envVariables: [string, string][]
): Record<string, string> => {
	return envVariables
		.map(([key, val]) => [key.trim(), val.trim()])
		.filter(([key, val]) => key && val)
		.reduce((acc, [key, value]) => {
			acc[key] = value;
			return acc;
		}, {} as Record<string, string>);
};

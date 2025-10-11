export const getEnvVariable = (name: string) => {
	if (
		typeof process !== 'undefined' &&
		typeof process.env !== 'undefined' &&
		process.env[name]
	) {
		return process.env[name];
	}

	if (typeof Deno !== 'undefined' && Deno.env.has(name)) {
		return Deno.env.get(name);
	}

	return undefined;
};

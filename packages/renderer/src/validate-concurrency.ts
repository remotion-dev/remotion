export const validateConcurrency = (value: unknown, setting: string) => {
	if (typeof value === 'undefined') {
		return;
	}

	if (value === null) {
		return;
	}

	if (typeof value !== 'number') {
		throw new Error(setting + ' must be a number but is ' + value);
	}

	if (value % 1 !== 0) {
		throw new Error(setting + ' must be an integer, but is ' + value);
	}

	if (value < 1) {
		throw new Error(setting + ' must be at least 1, but is ' + value);
	}

	if (value > require('os').cpus().length) {
		throw new Error(
			`${setting} is set higher than the amount of CPU cores available. Available CPU cores: ${
				require('os').cpus().length
			}, value set: ${value}`
		);
	}
};

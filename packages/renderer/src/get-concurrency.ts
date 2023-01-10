import os from 'os';

export const getActualConcurrency = (userPreference: number | string | null) => {
	if (userPreference === null) {
		return Math.round(Math.min(8, Math.max(1, os.cpus().length / 2)));
	}

	const max = os.cpus().length;
	const min = 1;
	let rounded;

	if (typeof userPreference === 'string') {
		const percentage = parseInt(userPreference.slice(0, -1), 10);
		rounded = Math.floor(percentage/100 * max);
	} else {
		rounded = Math.floor(userPreference);
	}

	if (rounded > max) {
		throw new Error(
			`Maximum for --concurrency is ${max} (number of cores on this system)`
		);
	}

	if (rounded < min) {
		throw new Error(`Minimum for concurrency is ${min}.`);
	}

	return rounded;
};

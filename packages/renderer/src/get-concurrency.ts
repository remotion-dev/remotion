import os from 'os';

export const getActualConcurrency = (userPreference: number | null) => {
	if (userPreference === null) {
		return Math.round(Math.min(8, Math.max(1, os.cpus().length / 2)));
	}

	const rounded = Math.floor(userPreference);
	const max = os.cpus().length;
	const min = 1;
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

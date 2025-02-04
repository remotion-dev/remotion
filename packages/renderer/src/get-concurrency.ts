import {getCpuCount} from './get-cpu-count';
import type {LogLevel} from './log-level';

export const resolveConcurrency = async ({
	indent,
	logLevel,
	userPreference,
}: {
	userPreference: number | string | null;
	indent: boolean;
	logLevel: LogLevel;
}) => {
	const maxCpus = await getCpuCount({indent, logLevel});

	if (userPreference === null) {
		return Math.round(Math.min(8, Math.max(1, maxCpus / 2)));
	}

	const min = 1;
	let rounded;

	if (typeof userPreference === 'string') {
		const percentage = parseInt(userPreference.slice(0, -1), 10);
		rounded = Math.floor((percentage / 100) * maxCpus);
	} else {
		rounded = Math.floor(userPreference);
	}

	if (rounded > maxCpus) {
		throw new Error(
			`Maximum for --concurrency is ${maxCpus} (number of cores on this system)`,
		);
	}

	if (rounded < min) {
		throw new Error(`Minimum for concurrency is ${min}.`);
	}

	return rounded;
};

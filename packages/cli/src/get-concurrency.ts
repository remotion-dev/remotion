import minimist from 'minimist';
import os from 'os';

export const getConcurrency = () => {
	const arg = minimist<{
		concurrency: number;
	}>(process.argv.slice(2));
	if (!arg.concurrency) {
		return Math.min(8, Math.max(1, os.cpus().length / 2));
	}
	if (typeof arg.concurrency !== 'number') {
		throw new Error('--concurrency flag must be a number.');
	}
	const rounded = Math.floor(arg.concurrency);
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
	return arg.concurrency;
};

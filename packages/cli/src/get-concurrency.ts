import minimist from 'minimist';

export const getConcurrency = (): number | null => {
	const arg = minimist<{
		concurrency: number;
	}>(process.argv.slice(2));
	if (!arg.concurrency) {
		return null;
	}
	if (typeof arg.concurrency !== 'number') {
		throw new Error('--concurrency flag must be a number.');
	}
	return arg.concurrency;
};

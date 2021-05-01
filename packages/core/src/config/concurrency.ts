export type Concurrency = number | null;

let currentConcurrency: null | number = null;

export const setConcurrency = (newConcurrency: Concurrency) => {
	if (typeof newConcurrency !== 'number') {
		throw new Error('--concurrency flag must be a number.');
	}

	currentConcurrency = newConcurrency;
};

export const getConcurrency = () => {
	return currentConcurrency;
};

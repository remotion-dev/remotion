export type Concurrency = number | null;

let currentConcurrency: null | number = null;

export const setConcurrency = (newConcurrency: Concurrency) => {
	currentConcurrency = newConcurrency;
};

export const getConcurrency = () => {
	return currentConcurrency;
};

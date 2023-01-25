export type Concurrency = number | string | null;

let currentConcurrency: null | number | string = null;

export const setConcurrency = (newConcurrency: Concurrency) => {
	currentConcurrency = newConcurrency;
};

export const getConcurrency = () => {
	return currentConcurrency;
};

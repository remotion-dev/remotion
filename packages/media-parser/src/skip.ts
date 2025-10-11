export type Skip = {
	action: 'skip';
	skipTo: number;
};

export const makeSkip = (skipTo: number): Skip => ({
	action: 'skip',
	skipTo,
});

export type FetchMoreData = {
	action: 'fetch-more-data';
	bytesNeeded: number;
};

export const makeFetchMoreData = (bytesNeeded: number): FetchMoreData => ({
	action: 'fetch-more-data',
	bytesNeeded,
});

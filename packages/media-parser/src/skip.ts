export type Skip = {
	action: 'skip';
	skipTo: number;
};

export const makeSkip = (skipTo: number): Skip => ({
	action: 'skip',
	skipTo,
});

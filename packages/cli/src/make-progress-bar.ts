export const makeProgressBar = (percentage: number) => {
	const totalBars = 20;
	const barsToShow = Math.floor(percentage * totalBars);
	return `[${'='.repeat(barsToShow).padEnd(totalBars, ' ')}]`;
};

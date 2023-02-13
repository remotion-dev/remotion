const full = '─';
const half = '╴';

export const makeProgressBar = (percentage: number) => {
	const totalBars = 20;
	const barsToShow = Math.floor(percentage * totalBars);
	const extraBar = (percentage * totalBars) % barsToShow;

	const base = full.repeat(barsToShow) + (extraBar > 0.5 ? half : '');
	if (percentage === 0) {
		return `${' '.repeat(totalBars + 1)}`;
	}

	if (percentage > 0 && barsToShow < 1) {
		return `╷${' '.repeat(totalBars)}`;
	}

	if (percentage >= 1) {
		return `╭${base.substring(0, base.length - 1)}╮`;
	}

	return `╭${base.padEnd(totalBars, ' ')}`;
};

import {RenderInternals} from '@remotion/renderer';
import {chalk} from './chalk';

const full = '━';
const half = '╸';
const half_right = '╺';
const totalBars = 18;

export const makeProgressBar = (percentage: number, noColor: boolean) => {
	const color = noColor ? false : RenderInternals.isColorSupported();
	const barsToShow = Math.floor(percentage * totalBars);
	const extraBar = (percentage * totalBars) % barsToShow;
	const grayBars = totalBars - barsToShow;

	const showHalf = extraBar > 0.5;

	const base = full.repeat(barsToShow) + (showHalf ? half : '');

	const gray = (RenderInternals.isColorSupported() ? full : ' ')
		.repeat(grayBars - (showHalf ? 1 : 0))
		.split('');
	if (!showHalf && barsToShow > 0 && gray.length > 0 && color) {
		gray[0] = half_right;
	}

	if (!color) {
		return `${base}${gray.join('')}`;
	}

	return `${chalk.blue(base)}${chalk.dim(gray.join(''))}`;
};

// @ts-expect-error
import ansiDiff from 'ansi-diff';
import chalk from 'chalk';

export const createProgressBar = () => {
	const diff = ansiDiff();
	process.stdout.write('');
	return {
		update: (up: string): boolean => process.stdout.write(diff.update(up)),
	};
};

export const makeProgressBar = (percentage: number) => {
	const totalBars = 20;
	const barsToShow = Math.floor(percentage * totalBars);
	return `[${'='.repeat(barsToShow).padEnd(totalBars, ' ')}]`;
};

export const makeBundlingProgress = ({
	progress,
	steps,
	doneIn,
}: {
	progress: number;
	steps: number;
	doneIn: number | null;
}) =>
	[
		'📦',
		`(1/${steps})`,
		makeProgressBar(progress),
		`${doneIn ? 'Bundled' : 'Bundling'} video`,
		doneIn !== null
			? chalk.gray(`${doneIn}ms`)
			: (progress * 100).toFixed(0) + '%',
	].join(' ');

export const makeRenderingProgress = ({
	frames,
	totalFrames,
	steps,
	concurrency,
	doneIn,
}: {
	frames: number;
	totalFrames: number;
	steps: number;
	concurrency: number;
	doneIn: number | null;
}) => {
	const progress = frames / totalFrames;
	return [
		'🖼 ',
		`(2/${steps})`,
		makeProgressBar(progress),
		`${doneIn ? 'Rendered' : 'Rendering'} frames (${concurrency}x)`,
		doneIn !== null ? chalk.gray(`${doneIn}ms`) : `${frames}/${totalFrames}`,
	].join(' ');
};
export const makeStitchingProgres = ({
	frames,
	totalFrames,
	steps,
	doneIn,
}: {
	frames: number;
	totalFrames: number;
	steps: number;
	doneIn: number | null;
}) => {
	const progress = frames / totalFrames;
	return [
		'🎞 ',
		`(3/${steps})`,
		makeProgressBar(progress),
		`${doneIn ? 'Encoded' : 'Encoding'} video`,
		doneIn !== null ? chalk.gray(`${doneIn}ms`) : `${frames}/${totalFrames}`,
	].join(' ');
};

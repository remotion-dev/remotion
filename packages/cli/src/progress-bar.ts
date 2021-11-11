// @ts-expect-error
import ansiDiff from 'ansi-diff';
import chalk from 'chalk';
import {Internals} from 'remotion';

export const createProgressBar = (): {
	update: (str: string) => boolean;
} => {
	if (!Internals.Logging.isEqualOrBelowLogLevel('info')) {
		return {update: () => false};
	}

	return createOverwriteableCliOutput();
};

export const createOverwriteableCliOutput = () => {
	const diff = ansiDiff();
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
		`(1/${steps})`,
		makeProgressBar(progress),
		`${doneIn ? 'Bundled' : 'Bundling'} code`,
		doneIn === null
			? (progress * 100).toFixed(0) + '%'
			: chalk.gray(`${doneIn}ms`),
	].join(' ');

type RenderingProgressInput = {
	frames: number;
	totalFrames: number;
	steps: number;
	concurrency: number;
	doneIn: number | null;
};

export const makeRenderingProgress = ({
	frames,
	totalFrames,
	steps,
	concurrency,
	doneIn,
}: RenderingProgressInput) => {
	const progress = frames / totalFrames;
	return [
		`(2/${steps})`,
		makeProgressBar(progress),
		[doneIn ? 'Rendered' : 'Rendering', `frames (${concurrency}x)`]
			.filter(Internals.truthy)
			.join(' '),
		doneIn === null ? `${frames}/${totalFrames}` : chalk.gray(`${doneIn}ms`),
	].join(' ');
};

type StitchingProgressInput = {
	frames: number;
	totalFrames: number;
	steps: number;
	doneIn: number | null;
	stage: 'encoding' | 'muxing';
};

export const makeStitchingProgress = ({
	frames,
	totalFrames,
	steps,
	doneIn,
	stage,
}: StitchingProgressInput) => {
	const progress = frames / totalFrames;
	return [
		`(3/${steps})`,
		makeProgressBar(progress),
		stage === 'muxing'
			? `${doneIn ? 'Muxed' : 'Muxing'} audio`
			: `${doneIn ? 'Encoded' : 'Encoding'} video`,
		doneIn === null ? `${frames}/${totalFrames}` : chalk.gray(`${doneIn}ms`),
	].join(' ');
};

export const makeRenderingAndStitchingProgress = ({
	rendering,
	stitching,
}: {
	rendering: RenderingProgressInput;
	stitching: StitchingProgressInput | null;
}) => {
	return [
		makeRenderingProgress(rendering),
		stitching === null ? null : makeStitchingProgress(stitching),
	].join('\n');
};

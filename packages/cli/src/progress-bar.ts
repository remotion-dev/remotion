import type {CancelSignal} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {AnsiDiff} from './ansi/ansi-diff';
import {chalk} from './chalk';
import {
	getFileSizeDownloadBar,
	makeMultiDownloadProgress,
} from './download-progress';
import {makeProgressBar} from './make-progress-bar';
import type {
	AggregateRenderProgress,
	RenderingProgressInput,
	StitchingProgressInput,
} from './progress-types';
import {truthy} from './truthy';

export type OverwriteableCliOutput = {
	update: (up: string, newline: boolean) => boolean;
};

export const createOverwriteableCliOutput = (options: {
	quiet: boolean;
	cancelSignal: CancelSignal | null;
	updatesDontOverwrite: boolean;
	indent: boolean;
}): OverwriteableCliOutput => {
	if (options.quiet) {
		return {
			update: () => false,
		};
	}

	if (options.updatesDontOverwrite) {
		return {
			update: (up: string) => {
				if (options.indent) {
					process.stdout.write(
						up
							.split('\n')
							.filter((a) => a.trim())

							.map((l) => {
								return `${RenderInternals.INDENT_TOKEN} ${l}`;
							})
							.join('\n')
					);
				} else {
					process.stdout.write(up + '\n');
				}

				return true;
			},
		};
	}

	const diff = new AnsiDiff();

	options.cancelSignal?.(() => {
		process.stdout.write(diff.finish());
	});

	return {
		update: (up: string, newline: boolean): boolean => {
			if (options.indent) {
				return process.stdout.write(
					diff.update(
						up
							.split('\n')
							.filter((a) => a.trim())
							.map((l) => `${RenderInternals.INDENT_TOKEN} ${l}`)
							.join('\n') + (newline ? '\n' : '')
					)
				);
			}

			return process.stdout.write(diff.update(up + (newline ? '\n' : '')));
		},
	};
};

const makeBundlingProgress = ({
	bundlingState,
	bundlingStep,
	steps,
}: {
	bundlingState: BundlingState;
	bundlingStep: number;
	steps: number;
}) => {
	const {doneIn, progress} = bundlingState;

	return [
		`(${bundlingStep + 1}/${steps})`,
		makeProgressBar(progress),
		`${doneIn ? 'Bundled' : 'Bundling'} code`,
		doneIn === null
			? (progress * 100).toFixed(0) + '%'
			: chalk.gray(`${doneIn}ms`),
	]
		.filter(truthy)
		.join(' ');
};

const makeCopyingProgress = (options: CopyingState) => {
	// Don't show copy progress lower than 200MB
	if (options.bytes < 1000 * 1000 * 200) {
		return null;
	}

	return [
		'    +',
		options.doneIn ? makeProgressBar(1) : getFileSizeDownloadBar(options.bytes),
		'Copying public dir',
		options.doneIn === null ? null : chalk.gray(`${options.doneIn}ms`),
	]
		.filter(truthy)
		.join(' ');
};

const makeSymlinkProgress = (options: SymbolicLinksState) => {
	if (options.symlinks.length === 0) {
		return null;
	}

	if (options.symlinks.length === 1) {
		return [
			chalk.gray(`      Found a symbolic link in the public folder:`),
			chalk.gray('      ' + options.symlinks[0]),
			chalk.gray('      The symlink will be forwarded in to the bundle.'),
		].join('\n');
	}

	return [
		chalk.gray(
			`      Found ${options.symlinks.length} symbolic links in the public folder.`
		),
		chalk.gray('      The symlinks will be forwarded in to the bundle.'),
	].join('\n');
};

export type CopyingState = {
	bytes: number;
	doneIn: number | null;
};

export type BundlingState = {
	progress: number;
	doneIn: number | null;
};

export type SymbolicLinksState = {symlinks: string[]};

export const makeBundlingAndCopyProgress = (
	{
		bundling,
		copying,
		symLinks,
	}: {
		bundling: BundlingState;
		copying: CopyingState;
		symLinks: SymbolicLinksState;
	},
	bundlingStep: number,
	steps: number
) => {
	return [
		makeBundlingProgress({
			bundlingState: bundling,
			bundlingStep,
			steps,
		}),
		makeCopyingProgress(copying),
		makeSymlinkProgress(symLinks),
	]
		.filter(truthy)
		.join('\n');
};

const makeRenderingProgress = ({
	frames,
	totalFrames,
	steps,
	concurrency,
	doneIn,
}: RenderingProgressInput) => {
	const progress = frames / totalFrames;
	return [
		`(${steps.indexOf('rendering') + 1}/${steps.length})`,
		makeProgressBar(progress),
		[doneIn ? 'Rendered' : 'Rendering', `frames (${concurrency}x)`]
			.filter(truthy)
			.join(' '),
		doneIn === null ? `${frames}/${totalFrames}` : chalk.gray(`${doneIn}ms`),
	]
		.filter(truthy)
		.join(' ');
};

const makeStitchingProgress = ({
	stitchingProgress,
	steps,
	stitchingStep,
}: {
	stitchingProgress: StitchingProgressInput;
	steps: number;
	stitchingStep: number;
}) => {
	const {frames, totalFrames, doneIn, stage, codec} = stitchingProgress;
	const progress = frames / totalFrames;
	const mediaType =
		codec === 'gif'
			? 'GIF'
			: RenderInternals.isAudioCodec(codec)
			? 'audio'
			: 'video';

	return [
		`(${stitchingStep + 1}/${steps})`,
		makeProgressBar(progress),
		stage === 'muxing' && RenderInternals.canUseParallelEncoding(codec)
			? `${doneIn ? 'Muxed' : 'Muxing'} ${mediaType}`
			: `${doneIn ? 'Encoded' : 'Encoding'} ${mediaType}`,
		doneIn === null ? `${frames}/${totalFrames}` : chalk.gray(`${doneIn}ms`),
	]
		.filter(truthy)
		.join(' ');
};

export const makeRenderingAndStitchingProgress = ({
	prog,
	steps,
	stitchingStep,
}: {
	prog: AggregateRenderProgress;
	steps: number;
	stitchingStep: number;
}): {
	output: string;
	progress: number;
	message: string;
} => {
	const {rendering, stitching, downloads, bundling} = prog;
	const output = [
		rendering ? makeRenderingProgress(rendering) : null,
		makeMultiDownloadProgress(downloads),
		stitching === null
			? null
			: makeStitchingProgress({
					stitchingProgress: stitching,
					steps,
					stitchingStep,
			  }),
	]
		.filter(truthy)
		.join('\n');
	const renderProgress = rendering
		? rendering.frames / rendering.totalFrames
		: 0;
	const stitchingProgress = stitching
		? stitching.frames / stitching.totalFrames
		: 0;

	const progress =
		bundling.progress * 0.3 + renderProgress * 0.6 + stitchingProgress * 0.1;

	return {output, progress, message: getGuiProgressSubtitle(prog)};
};

const getGuiProgressSubtitle = (progress: AggregateRenderProgress): string => {
	// Handle floating point inaccuracies
	if (progress.bundling.progress < 0.99999) {
		return `Bundling ${Math.round(progress.bundling.progress * 100)}%`;
	}

	if (progress.copyingState.doneIn === null) {
		if (progress.copyingState.bytes < 100_000_000) {
			return 'Bundling 100%';
		}

		const bytes = new Intl.NumberFormat('en', {
			notation: 'compact',
			style: 'unit',
			unit: 'byte',
			unitDisplay: 'narrow',
		});
		return `Copying ${bytes.format(progress.copyingState.bytes)}`;
	}

	if (!progress.rendering) {
		return `Getting compositions`;
	}

	const allRendered =
		progress.rendering.frames === progress.rendering.totalFrames;

	if (!allRendered || !progress.stitching || progress.stitching.frames === 0) {
		return `Rendering ${progress.rendering.frames}/${progress.rendering.totalFrames}`;
	}

	return `Stitching ${progress.stitching.frames}/${progress.stitching.totalFrames}`;
};

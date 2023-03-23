import type {CancelSignal} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {AnsiDiff} from './ansi/ansi-diff';
import {chalk} from './chalk';
import {ConfigInternals} from './config';
import {
	getFileSizeDownloadBar,
	makeMultiDownloadProgress,
} from './download-progress';
import {INDENT_TOKEN} from './log';
import {makeProgressBar} from './make-progress-bar';
import type {
	AggregateRenderProgress,
	RenderingProgressInput,
	StitchingProgressInput,
} from './progress-types';
import {truthy} from './truthy';

export const createProgressBar = (
	quiet: boolean,
	cancelSignal: CancelSignal | null
): {
	update: (str: string) => boolean;
} => {
	if (
		!RenderInternals.isEqualOrBelowLogLevel(
			ConfigInternals.Logging.getLogLevel(),
			'info'
		)
	) {
		return {update: () => false};
	}

	return createOverwriteableCliOutput({quiet, cancelSignal});
};

export type OverwriteableCliOutput = {
	update: (up: string) => boolean;
};

export const createOverwriteableCliOutput = (options: {
	quiet: boolean;
	cancelSignal: CancelSignal | null;
}): OverwriteableCliOutput => {
	if (options.quiet) {
		return {
			update: () => false,
		};
	}

	const diff = new AnsiDiff();

	options.cancelSignal?.(() => {
		process.stdout.write(diff.finish());
	});

	return {
		update: (up: string): boolean => process.stdout.write(diff.update(up)),
	};
};

const makeBundlingProgress = ({
	bundlingState,
	indent,
	bundlingStep,
	steps,
}: {
	bundlingState: BundlingState;
	indent: boolean;
	bundlingStep: number;
	steps: number;
}) => {
	const {doneIn, progress} = bundlingState;

	return [
		indent ? INDENT_TOKEN : null,
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

const makeCopyingProgress = (options: CopyingState, indent: boolean) => {
	// Don't show copy progress lower than 200MB
	if (options.bytes < 1000 * 1000 * 200) {
		return null;
	}

	return [
		indent ? INDENT_TOKEN : null,
		'    +',
		options.doneIn ? makeProgressBar(1) : getFileSizeDownloadBar(options.bytes),
		'Copying public dir',
		options.doneIn === null ? null : chalk.gray(`${options.doneIn}ms`),
	]
		.filter(truthy)
		.join(' ');
};

const makeSymlinkProgress = (options: SymbolicLinksState, indent: boolean) => {
	if (options.symlinks.length === 0) {
		return null;
	}

	if (options.symlinks.length === 1) {
		return [
			chalk.gray(`      Found a symbolic link in the public folder:`),
			chalk.gray('      ' + options.symlinks[0]),
			chalk.gray('      The symlink will be forwarded in to the bundle.'),
		]
			.map((l) => {
				return indent ? `${INDENT_TOKEN} ${l}` : null;
			})
			.join('\n');
	}

	return [
		chalk.gray(
			`      Found ${options.symlinks.length} symbolic links in the public folder.`
		),
		chalk.gray('      The symlinks will be forwarded in to the bundle.'),
	]
		.map((l) => {
			return indent ? `${INDENT_TOKEN} ${l}` : null;
		})
		.join('\n');
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
	indent: boolean,
	bundlingStep: number,
	steps: number
) => {
	return [
		makeBundlingProgress({
			bundlingState: bundling,
			indent,
			bundlingStep,
			steps,
		}),
		makeCopyingProgress(copying, indent),
		makeSymlinkProgress(symLinks, indent),
	]
		.filter(truthy)
		.join('\n');
};

export const makeRenderingProgress = (
	{frames, totalFrames, steps, concurrency, doneIn}: RenderingProgressInput,
	indent: boolean
) => {
	const progress = frames / totalFrames;
	return [
		indent ? INDENT_TOKEN : null,
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

export const makeStitchingProgress = ({
	stitchingProgress,
	indent,
	steps,
	stitchingStep,
}: {
	stitchingProgress: StitchingProgressInput;
	indent: boolean;
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
		indent ? INDENT_TOKEN : null,
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
	indent,
	steps,
	stitchingStep,
}: {
	prog: AggregateRenderProgress;
	indent: boolean;
	steps: number;
	stitchingStep: number;
}): {
	output: string;
	progress: number;
	message: string;
} => {
	const {rendering, stitching, downloads, bundling} = prog;
	const output = [
		rendering ? makeRenderingProgress(rendering, indent) : null,
		makeMultiDownloadProgress(downloads, indent),
		stitching === null
			? null
			: makeStitchingProgress({
					stitchingProgress: stitching,
					indent,
					steps,
					stitchingStep,
			  }),
	]
		.filter(truthy)
		.join('\n');
	const renderProgress = rendering
		? rendering.frames / rendering.totalFrames
		: 0;

	// TODO: Factor in stitching progress
	const progress = bundling.progress * 0.3 + renderProgress * 0.7;

	return {output, progress, message: getGuiProgressSubtitle(prog)};
};

export const getGuiProgressSubtitle = (
	progress: AggregateRenderProgress
): string => {
	if (progress.bundling.progress < 1) {
		return `Bundling ${Math.round(progress.bundling.progress * 100)}%`;
	}

	if (!progress.copyingState.doneIn) {
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

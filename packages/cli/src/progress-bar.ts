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
import type {RenderStep} from './step';
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

const makeBundlingProgress = (
	{
		progress,
		steps,
		doneIn,
	}: {
		progress: number;
		steps: RenderStep[];
		doneIn: number | null;
	},
	indent: boolean
) =>
	[
		indent ? INDENT_TOKEN : null,
		`(${steps.indexOf('bundling') + 1}/${steps.length})`,
		makeProgressBar(progress),
		`${doneIn ? 'Bundled' : 'Bundling'} code`,
		doneIn === null
			? (progress * 100).toFixed(0) + '%'
			: chalk.gray(`${doneIn}ms`),
	]
		.filter(truthy)
		.join(' ');

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
	steps: RenderStep[];
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
	indent: boolean
) => {
	return [
		makeBundlingProgress(bundling, indent),
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

export const makeStitchingProgress = (
	{frames, totalFrames, steps, doneIn, stage, codec}: StitchingProgressInput,
	indent: boolean
) => {
	const progress = frames / totalFrames;
	const mediaType =
		codec === 'gif'
			? 'GIF'
			: RenderInternals.isAudioCodec(codec)
			? 'audio'
			: 'video';

	return [
		indent ? INDENT_TOKEN : null,
		`(${steps.indexOf('stitching') + 1}/${steps.length})`,
		makeProgressBar(progress),
		stage === 'muxing' && RenderInternals.canUseParallelEncoding(codec)
			? `${doneIn ? 'Muxed' : 'Muxing'} ${mediaType}`
			: `${doneIn ? 'Encoded' : 'Encoding'} ${mediaType}`,
		doneIn === null ? `${frames}/${totalFrames}` : chalk.gray(`${doneIn}ms`),
	]
		.filter(truthy)
		.join(' ');
};

export const makeRenderingAndStitchingProgress = (
	prog: AggregateRenderProgress,
	indent: boolean
): {
	output: string;
	progress: number;
	message: string;
} => {
	const {rendering, stitching, downloads, bundling} = prog;
	const output = [
		rendering ? makeRenderingProgress(rendering, indent) : null,
		makeMultiDownloadProgress(downloads, indent),
		stitching === null ? null : makeStitchingProgress(stitching, indent),
	]
		.filter(truthy)
		.join('\n');
	const renderProgress = rendering
		? rendering.frames / rendering.totalFrames
		: 0;

	// TODO: Factor in stitching progress
	const progress = bundling.progress * 0.3 + renderProgress * 0.7;

	return {output, progress, message: getMessage(prog)};
};

export const getMessage = (progress: AggregateRenderProgress): string => {
	if (progress.bundling.progress < 1 && progress.bundling.message) {
		return progress.bundling.message;
	}

	// TODO: Better message than "Rendering..."
	return `Rendering...`;
};

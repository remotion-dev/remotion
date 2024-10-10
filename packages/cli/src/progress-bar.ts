import type {CancelSignal, LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {NoReactAPIs} from '@remotion/renderer/pure';
import type {
	AggregateRenderProgress,
	BundlingState,
	CopyingState,
	RenderingProgressInput,
	StitchingProgressInput,
} from '@remotion/studio-server';
import {StudioServerInternals} from '@remotion/studio-server';
import {formatBytes, type ArtifactProgress} from '@remotion/studio-shared';
import {chalk} from './chalk';
import {
	getFileSizeDownloadBar,
	makeMultiDownloadProgress,
} from './download-progress';
import {formatEtaString} from './eta-string';
import {makeHyperlink} from './hyperlinks/make-link';
import {Log} from './log';
import {makeProgressBar} from './make-progress-bar';
import {truthy} from './truthy';
export type OverwriteableCliOutput = {
	update: (up: string, newline: boolean) => boolean;
};

export const LABEL_WIDTH = 20;

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
							.join('\n') + '\n',
					);
				} else {
					process.stdout.write(up + '\n');
				}

				return true;
			},
		};
	}

	const diff = new StudioServerInternals.AnsiDiff();

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
							.join('\n') + (newline ? '\n' : ''),
					),
				);
			}

			return process.stdout.write(diff.update(up + (newline ? '\n' : '')));
		},
	};
};

const makeBundlingProgress = ({
	bundlingState,
}: {
	bundlingState: BundlingState;
}) => {
	const {doneIn, progress} = bundlingState;

	return [
		`${doneIn ? 'Bundled' : 'Bundling'} code`.padEnd(LABEL_WIDTH, ' '),
		makeProgressBar(progress, false),
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
		'Copying public dir'.padEnd(LABEL_WIDTH, ' '),
		options.doneIn
			? makeProgressBar(1, false)
			: getFileSizeDownloadBar(options.bytes),
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
			`      Found ${options.symlinks.length} symbolic links in the public folder.`,
		),
		chalk.gray('      The symlinks will be forwarded in to the bundle.'),
	].join('\n');
};

export type SymbolicLinksState = {symlinks: string[]};

export const makeBundlingAndCopyProgress = ({
	bundling,
	copying,
	symLinks,
}: {
	bundling: BundlingState;
	copying: CopyingState;
	symLinks: SymbolicLinksState;
}) => {
	return [
		makeBundlingProgress({
			bundlingState: bundling,
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
	doneIn,
	timeRemainingInMilliseconds,
}: RenderingProgressInput) => {
	const progress = frames / totalFrames;
	return [
		[doneIn ? 'Rendered' : 'Rendering', totalFrames === 1 ? 'still' : 'frames']
			.filter(truthy)
			.join(' ')
			.padEnd(LABEL_WIDTH, ' '),
		makeProgressBar(progress, false),
		doneIn === null
			? [
					`${frames}/${totalFrames}`.padStart(getRightLabelWidth(totalFrames)),
					timeRemainingInMilliseconds
						? chalk.gray(
								`${formatEtaString(timeRemainingInMilliseconds)} remaining`,
							)
						: null,
				]
					.filter(truthy)
					.join(' ')
			: chalk.gray(`${doneIn}ms`),
	]
		.filter(truthy)
		.join(' ');
};

const makeArtifactProgress = (artifactState: ArtifactProgress) => {
	const {received} = artifactState;
	if (received.length === 0) {
		return null;
	}

	return received
		.map((artifact) => {
			return [
				chalk.blue((artifact.alreadyExisted ? '○' : '+').padEnd(LABEL_WIDTH)),
				chalk.blue(
					makeHyperlink({
						url: 'file://' + artifact.absoluteOutputDestination,
						fallback: artifact.absoluteOutputDestination,
						text: artifact.relativeOutputDestination,
					}),
				),
				chalk.gray(`${formatBytes(artifact.sizeInBytes)}`),
			].join(' ');
		})
		.filter(truthy)
		.join('\n');
};

export const getRightLabelWidth = (totalFrames: number) => {
	return `${totalFrames}/${totalFrames}`.length;
};

const makeStitchingProgress = ({
	stitchingProgress,
	isUsingParallelEncoding,
}: {
	stitchingProgress: StitchingProgressInput;
	isUsingParallelEncoding: boolean;
}) => {
	const {frames, totalFrames, doneIn, stage, codec} = stitchingProgress;
	const progress = frames / totalFrames;
	const mediaType =
		codec === 'gif'
			? 'GIF'
			: NoReactAPIs.isAudioCodec(codec)
				? 'audio'
				: 'video';

	return [
		(stage === 'muxing' && isUsingParallelEncoding
			? `${doneIn ? 'Muxed' : 'Muxing'} ${mediaType}`
			: `${doneIn ? 'Encoded' : 'Encoding'} ${mediaType}`
		).padEnd(LABEL_WIDTH, ' '),
		makeProgressBar(progress, false),
		doneIn === null
			? `${String(frames).padStart(String(totalFrames).length, ' ')}/${totalFrames}`
			: chalk.gray(`${doneIn}ms`),
	]
		.filter(truthy)
		.join(' ');
};

export const makeRenderingAndStitchingProgress = ({
	prog,
	isUsingParallelEncoding,
}: {
	prog: AggregateRenderProgress;
	isUsingParallelEncoding: boolean;
}): {
	output: string;
	progress: number;
	message: string;
} => {
	const {rendering, stitching, downloads, bundling, artifactState} = prog;
	const output = [
		rendering ? makeRenderingProgress(rendering) : null,
		makeMultiDownloadProgress(downloads, rendering?.totalFrames ?? 0),
		stitching === null
			? null
			: makeStitchingProgress({
					stitchingProgress: stitching,
					isUsingParallelEncoding,
				}),
		makeArtifactProgress(artifactState),
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

	if (
		progress.bundling.progress === 1 &&
		progress.bundling.doneIn === null &&
		progress.copyingState.bytes === 0
	) {
		return `Bundling ${Math.round(progress.bundling.progress * 100)}%`;
	}

	if (progress.copyingState.doneIn === null) {
		return `Copying public dir ${StudioServerInternals.formatBytes(
			progress.copyingState.bytes,
		)}`;
	}

	if (!progress.rendering) {
		return `Getting compositions`;
	}

	// Get render estimated time value and extract hours, minutes, and seconds
	const {timeRemainingInMilliseconds} = progress.rendering;

	// Create estimated time string by concatenating them with colons
	const estimatedTimeString =
		timeRemainingInMilliseconds === null
			? null
			: formatEtaString(timeRemainingInMilliseconds);

	const allRendered =
		progress.rendering.frames === progress.rendering.totalFrames;

	if (!allRendered || !progress.stitching || progress.stitching.frames === 0) {
		const etaString =
			timeRemainingInMilliseconds && timeRemainingInMilliseconds > 0
				? `, time remaining: ${estimatedTimeString}`
				: '';
		return `Rendered ${progress.rendering.frames}/${progress.rendering.totalFrames}${etaString}`;
	}

	return `Stitched ${progress.stitching.frames}/${progress.stitching.totalFrames}`;
};

export const printFact =
	(printLevel: LogLevel) =>
	({
		indent,
		logLevel,
		left,
		right,
		color,
		link,
	}: {
		indent: boolean;
		logLevel: LogLevel;
		left: string;
		right: string;
		link?: string;
		color: 'blue' | 'blueBright' | 'gray' | undefined;
	}) => {
		const fn = (str: string) => {
			if (color === 'gray') {
				return chalk.gray(str);
			}

			if (color === 'blue') {
				return chalk.blue(str);
			}

			if (color === 'blueBright') {
				return chalk.blueBright(str);
			}

			return str;
		};

		if (RenderInternals.isEqualOrBelowLogLevel(logLevel, 'verbose')) {
			Log[printLevel]({indent, logLevel}, fn(`${left} = ${right}`));

			return;
		}

		let leftPadded = left.padEnd(LABEL_WIDTH, ' ');
		if (link) {
			const endPadding = LABEL_WIDTH - left.length;
			leftPadded =
				makeHyperlink({
					text: left,
					fallback: left,
					url: link,
				}) + ' '.repeat(endPadding);
		}

		Log[printLevel]({indent, logLevel}, fn(`${leftPadded} ${right}`));
	};

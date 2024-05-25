import {CliInternals} from '@remotion/cli';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {NoReactInternals} from 'remotion/no-react';
import type {
	CleanupInfo,
	EncodingProgress,
	RenderProgress,
} from '../../../defaults';
import type {ChunkRetry} from '../../../functions/helpers/get-retry-stats';
import {truthy} from '../../../shared/truthy';

type LambdaInvokeProgress = {
	totalLambdas: number | null;
	lambdasInvoked: number;
};

type ChunkProgress = {
	doneIn: number | null;
	framesRendered: number;
	framesEncoded: number;
	totalFrames: number | null;
	totalChunks: number | null;
	chunksEncoded: number;
};

type MultiRenderProgress = {
	lambdaInvokeProgress: LambdaInvokeProgress;
	chunkProgress: ChunkProgress;
	encodingProgress: EncodingProgress;
	cleanupInfo: CleanupInfo | null;
};

const makeInvokeProgress = (
	invokeProgress: LambdaInvokeProgress,
	retriesInfo: ChunkRetry[],
) => {
	const {lambdasInvoked, totalLambdas} = invokeProgress;
	const progress = totalLambdas === null ? 0 : lambdasInvoked / totalLambdas;
	return [
		`${progress === 0 ? 'Invoked' : 'Invoking'} lambdas`.padEnd(
			CliInternals.LABEL_WIDTH,
		),
		CliInternals.makeProgressBar(progress),
		progress === 1
			? CliInternals.chalk.gray('100%')
			: `${Math.round(progress * 100)}%`,
		retriesInfo.length > 0 ? `(+${retriesInfo.length} retries)` : [],
	].join(' ');
};

const makeRenderProgress = ({
	chunkProgress,
}: {
	chunkProgress: ChunkProgress;
}) => {
	const {doneIn, framesRendered, totalFrames, framesEncoded} = chunkProgress;
	const renderProgress =
		totalFrames === null ? 0 : framesRendered / totalFrames;
	const encodingProgress =
		totalFrames === null ? 0 : framesEncoded / totalFrames;

	const frames =
		chunkProgress.totalFrames === null
			? null
			: `${chunkProgress.framesRendered}/${chunkProgress.totalFrames}`;

	const first = [
		(doneIn === null ? 'Rendering frames' : 'Rendered frames').padEnd(
			CliInternals.LABEL_WIDTH,
			' ',
		),
		CliInternals.makeProgressBar(renderProgress),
		doneIn === null ? frames : CliInternals.chalk.gray(`${doneIn}ms`),
	]
		.filter(truthy)
		.join(' ');

	const second = [
		`${doneIn === null ? 'Encoding' : 'Encoded'} frames`.padEnd(
			CliInternals.LABEL_WIDTH,
			' ',
		),
		CliInternals.makeProgressBar(encodingProgress),
		doneIn === null
			? totalFrames === null
				? null
				: `${framesEncoded}/${totalFrames}`
			: CliInternals.chalk.gray(`${doneIn}ms`),
	]
		.filter(truthy)
		.join(' ');

	return [first, second];
};

const makeEncodingProgress = ({
	encodingProgress,
	chunkProgress,
	totalFrames,
	timeToEncode,
}: {
	encodingProgress: EncodingProgress;
	chunkProgress: ChunkProgress;
	totalFrames: number | null;
	timeToEncode: number | null;
}) => {
	const {framesEncoded} = encodingProgress;
	const progress = totalFrames === null ? 0 : framesEncoded / totalFrames;
	const chunksDone = chunkProgress.doneIn !== null;
	const shouldShow = progress > 0 || chunksDone;
	if (!shouldShow) {
		return '';
	}

	return [
		`${timeToEncode === null ? 'Combining' : 'Combined'} videos`.padEnd(
			CliInternals.LABEL_WIDTH,
			' ',
		),
		CliInternals.makeProgressBar(progress),
		timeToEncode === null
			? `${Math.round(progress * 100)}%`
			: CliInternals.chalk.gray(`${timeToEncode}ms`),
	].join(' ');
};

const makeCleanupProgress = (
	cleanupInfo: CleanupInfo | null,
	skipped: boolean,
) => {
	if (!cleanupInfo) {
		return '';
	}

	if (skipped) {
		return [
			CliInternals.chalk.blueBright(
				`Not cleaning up because --log=verbose was set`,
			),
		].join(' ');
	}

	const {doneIn, filesDeleted, minFilesToDelete} = cleanupInfo;
	const progress = filesDeleted / minFilesToDelete;
	return [
		CliInternals.makeProgressBar(progress),
		`${doneIn === null ? 'Cleaning up' : 'Cleaned up'} artifacts`,
		doneIn === null
			? `${Math.round(progress * 100)}%`
			: CliInternals.chalk.gray(`${doneIn}ms`),
	].join(' ');
};

const makeDownloadProgress = (
	downloadInfo: DownloadedInfo,
	totalSteps: number,
) => {
	return [
		`(6/${totalSteps})`,
		downloadInfo.totalSize === null
			? CliInternals.getFileSizeDownloadBar(downloadInfo.downloaded)
			: CliInternals.makeProgressBar(
					downloadInfo.downloaded / downloadInfo.totalSize,
				),
		`${downloadInfo.doneIn === null ? 'Downloading' : 'Downloaded'} video`,
		downloadInfo.doneIn === null
			? [
					`${CliInternals.formatBytes(downloadInfo.downloaded)}`,
					downloadInfo.totalSize === null
						? null
						: `${CliInternals.formatBytes(downloadInfo.totalSize)}`,
				]
					.filter(NoReactInternals.truthy)
					.join('/')
			: CliInternals.chalk.gray(`${downloadInfo.doneIn}ms`),
	].join(' ');
};

export const makeMultiProgressFromStatus = (
	status: RenderProgress,
): MultiRenderProgress => {
	return {
		chunkProgress: {
			chunksEncoded: status.chunks,
			totalChunks: status.renderMetadata?.totalChunks ?? null,
			doneIn: status.timeToFinishChunks,
			framesRendered: status.framesRendered,
			framesEncoded: status.encodingStatus?.framesEncoded ?? 0,
			totalFrames:
				status.renderMetadata && status.renderMetadata.type === 'video'
					? RenderInternals.getFramesToRender(
							status.renderMetadata.frameRange,
							status.renderMetadata.everyNthFrame,
						).length
					: null,
		},
		encodingProgress: {
			framesEncoded: status.encodingStatus?.framesEncoded ?? 0,
		},
		lambdaInvokeProgress: {
			lambdasInvoked: status.lambdasInvoked,
			totalLambdas:
				status.renderMetadata?.estimatedRenderLambdaInvokations ?? null,
		},
		cleanupInfo: status.cleanup,
	};
};

type DownloadedInfo = {
	totalSize: number | null;
	downloaded: number;
	doneIn: number | null;
};

export const makeProgressString = ({
	progress,
	steps,
	downloadInfo,
	retriesInfo,
	logLevel,
	timeToEncode,
	totalFrames,
}: {
	progress: MultiRenderProgress;
	steps: number;
	downloadInfo: DownloadedInfo | null;
	retriesInfo: ChunkRetry[];
	logLevel: LogLevel;
	timeToEncode: number | null;
	totalFrames: number | null;
}) => {
	return [
		makeInvokeProgress(progress.lambdaInvokeProgress, retriesInfo),
		...makeRenderProgress({
			chunkProgress: progress.chunkProgress,
		}),
		makeEncodingProgress({
			encodingProgress: progress.encodingProgress,
			chunkProgress: progress.chunkProgress,
			timeToEncode,
			totalFrames,
		}),
		makeCleanupProgress(progress.cleanupInfo, logLevel === 'verbose'),
		downloadInfo ? makeDownloadProgress(downloadInfo, steps) : null,
	]
		.filter(NoReactInternals.truthy)
		.join('\n');
};

import {CliInternals} from '@remotion/cli';
import {Internals} from 'remotion';
import type {
	CleanupInfo,
	EncodingProgress,
	RenderProgress,
} from '../../../defaults';
import type {ChunkRetry} from '../../../functions/helpers/get-retry-stats';

type LambdaInvokeProgress = {
	totalLambdas: number | null;
	lambdasInvoked: number;
	doneIn: number | null;
};

type ChunkProgress = {
	totalChunks: number | null;
	chunksInvoked: number;
	doneIn: number | null;
};

type MultiRenderProgress = {
	lambdaInvokeProgress: LambdaInvokeProgress;
	chunkProgress: ChunkProgress;
	encodingProgress: EncodingProgress;
	cleanupInfo: CleanupInfo | null;
};

const makeInvokeProgress = (
	invokeProgress: LambdaInvokeProgress,
	totalSteps: number,
	retriesInfo: ChunkRetry[]
) => {
	const {lambdasInvoked, totalLambdas, doneIn} = invokeProgress;
	const progress = doneIn
		? 1
		: totalLambdas === null
		? 0
		: lambdasInvoked / totalLambdas;
	return [
		'⚡️',
		`(1/${totalSteps})`,
		CliInternals.makeProgressBar(progress),
		`${doneIn === null ? 'Invoking' : 'Invoked'} lambdas`,
		doneIn === null
			? `${Math.round(progress * 100)}%`
			: CliInternals.chalk.gray(`${doneIn}ms`),
		retriesInfo.length > 0 ? `(+${retriesInfo.length} retries)` : [],
	].join(' ');
};

const makeChunkProgress = ({
	chunkProgress,
	invokeProgress,
	totalSteps,
}: {
	chunkProgress: ChunkProgress;
	invokeProgress: LambdaInvokeProgress;
	totalSteps: number;
}) => {
	const lambdaIsDone = invokeProgress.doneIn !== null;
	const {chunksInvoked, totalChunks, doneIn} = chunkProgress;
	const progress = totalChunks === null ? 0 : chunksInvoked / totalChunks;
	const shouldShow = lambdaIsDone || progress > 0;
	if (!shouldShow) {
		return '';
	}

	return [
		'🧩',
		`(2/${totalSteps})`,
		CliInternals.makeProgressBar(progress),
		`${doneIn === null ? 'Rendering' : 'Rendered'} chunks`,
		doneIn === null
			? `${Math.round(progress * 100)}%`
			: CliInternals.chalk.gray(`${doneIn}ms`),
	].join(' ');
};

const makeEncodingProgress = ({
	encodingProgress,
	chunkProgress,
	totalSteps,
}: {
	encodingProgress: EncodingProgress;
	chunkProgress: ChunkProgress;
	totalSteps: number;
}) => {
	const {framesEncoded, totalFrames, doneIn} = encodingProgress;
	const progress = totalFrames === null ? 0 : framesEncoded / totalFrames;
	const chunksDone = chunkProgress.doneIn !== null;
	const shouldShow = progress > 0 || chunksDone;
	if (!shouldShow) {
		return '';
	}

	return [
		'📽 ',
		`(3/${totalSteps})`,
		CliInternals.makeProgressBar(progress),
		`${doneIn === null ? 'Combining' : 'Combined'} videos`,
		doneIn === null
			? `${Math.round(progress * 100)}%`
			: CliInternals.chalk.gray(`${doneIn}ms`),
	].join(' ');
};

const makeCleanupProgress = (
	cleanupInfo: CleanupInfo | null,
	totalSteps: number
) => {
	if (!cleanupInfo) {
		return '';
	}

	const {doneIn, filesDeleted, minFilesToDelete} = cleanupInfo;
	const progress = filesDeleted / minFilesToDelete;
	return [
		'🪣 ',
		`(4/${totalSteps})`,
		CliInternals.makeProgressBar(progress),
		`${doneIn === null ? 'Cleaning up' : 'Cleaned up'} artifacts`,
		doneIn === null
			? `${Math.round(progress * 100)}%`
			: CliInternals.chalk.gray(`${doneIn}ms`),
	].join(' ');
};

const makeDownloadProgress = (
	downloadInfo: DownloadedInfo,
	totalSteps: number
) => {
	return [
		'💾',
		`(5/${totalSteps})`,
		downloadInfo.totalSize === null
			? CliInternals.getFileSizeDownloadBar(downloadInfo.downloaded)
			: CliInternals.makeProgressBar(
					downloadInfo.downloaded / downloadInfo.totalSize
			  ),
		`${downloadInfo.doneIn === null ? 'Downloading' : 'Downloaded'} video`,
		downloadInfo.doneIn === null
			? [
					`${CliInternals.formatBytes(downloadInfo.downloaded)}`,
					downloadInfo.totalSize === null
						? null
						: `${CliInternals.formatBytes(downloadInfo.totalSize)}`,
			  ]
					.filter(Internals.truthy)
					.join('/')
			: CliInternals.chalk.gray(`${downloadInfo.doneIn}ms`),
	].join(' ');
};

export const makeMultiProgressFromStatus = (
	status: RenderProgress
): MultiRenderProgress => {
	return {
		chunkProgress: {
			chunksInvoked: status.chunks,
			totalChunks: status.renderMetadata?.totalChunks ?? null,
			doneIn: status.timeToFinishChunks,
		},
		encodingProgress: {
			framesEncoded: status.encodingStatus?.framesEncoded ?? 0,
			totalFrames: status.renderMetadata?.videoConfig.durationInFrames ?? 1,
			doneIn: status.encodingStatus?.doneIn ?? null,
			timeToInvoke: status.encodingStatus?.timeToInvoke ?? null,
		},
		lambdaInvokeProgress: {
			doneIn: status.timeToInvokeLambdas,
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
}: {
	progress: MultiRenderProgress;
	steps: number;
	downloadInfo: DownloadedInfo | null;
	retriesInfo: ChunkRetry[];
}) => {
	return [
		makeInvokeProgress(progress.lambdaInvokeProgress, steps, retriesInfo),
		makeChunkProgress({
			chunkProgress: progress.chunkProgress,
			invokeProgress: progress.lambdaInvokeProgress,
			totalSteps: steps,
		}),
		makeEncodingProgress({
			encodingProgress: progress.encodingProgress,
			chunkProgress: progress.chunkProgress,
			totalSteps: steps,
		}),
		makeCleanupProgress(progress.cleanupInfo, steps),
		downloadInfo ? makeDownloadProgress(downloadInfo, steps) : null,
	]
		.filter(Internals.truthy)
		.join('\n');
};

import {CliInternals} from '@remotion/cli';
import {CleanupInfo, EncodingProgress, RenderProgress} from '../../../defaults';

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

export type MultiRenderProgress = {
	lambdaInvokeProgress: LambdaInvokeProgress;
	chunkProgress: ChunkProgress;
	encodingProgress: EncodingProgress;
	cleanupInfo: CleanupInfo | null;
};

export const makeInvokeProgress = (
	chunkProgress: LambdaInvokeProgress,
	totalSteps: number
) => {
	const {lambdasInvoked, totalLambdas, doneIn} = chunkProgress;
	const progress = totalLambdas === null ? 0 : lambdasInvoked / totalLambdas;
	return [
		'🌩 ',
		`(1/${totalSteps})`,
		CliInternals.makeProgressBar(progress),
		`${doneIn === null ? 'Invoking' : 'Invoked'} lambdas`,
		doneIn === null
			? `${Math.round(progress * 100)}%`
			: CliInternals.chalk.gray(`${doneIn}ms`),
	].join(' ');
};

export const makeChunkProgress = (
	chunkProgress: ChunkProgress,
	totalSteps: number
) => {
	const {chunksInvoked, totalChunks, doneIn} = chunkProgress;
	const progress = totalChunks === null ? 0 : chunksInvoked / totalChunks;
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

export const makeEncodingProgress = (
	encodingProgress: EncodingProgress,
	totalSteps: number
) => {
	const {framesEncoded, totalFrames, doneIn} = encodingProgress;
	const progress = totalFrames === null ? 0 : framesEncoded / totalFrames;
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

export const makeCleanupProgress = (
	cleanupInfo: CleanupInfo | null,
	totalSteps: number
) => {
	if (!cleanupInfo) {
		return '';
	}

	const {doneIn, filesDeleted, filesToDelete} = cleanupInfo;
	const progress = filesDeleted / filesToDelete;
	return [
		'🪣 ',
		`(4/${totalSteps})`,
		CliInternals.makeProgressBar(progress),
		`${doneIn === null ? 'Cleaning up' : 'Cleaned up'} artifacts`,
		doneIn === null
			? `${Math.round(progress * 100)}%`
			: CliInternals.chalk.gray('ms'),
	].join(' ');
};

export const makeDownloadProgess = (
	totalSteps: number,
	downloadedYet: boolean
) => {
	return [
		'💾',
		`(5/${totalSteps})`,
		// TODO: More granularly
		CliInternals.makeProgressBar(Number(downloadedYet)),
		`${downloadedYet ? 'Downloaded' : 'Downloading'} video`,
		// TODO
		downloadedYet ? CliInternals.chalk.gray('TODOms') : '0%',
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
		},
		lambdaInvokeProgress: {
			doneIn: null,
			lambdasInvoked: status.lambdasInvoked,
			totalLambdas:
				status.renderMetadata?.estimatedRenderLambdaInvokations ?? null,
		},
		cleanupInfo: status.cleanup,
	};
};

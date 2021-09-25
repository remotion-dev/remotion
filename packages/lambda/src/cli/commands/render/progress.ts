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
	return [
		'🌩 ',
		`(1/${totalSteps})`,
		CliInternals.makeProgressBar(
			totalLambdas === null ? 0 : lambdasInvoked / totalLambdas
		),
		`${doneIn === null ? 'Invoking' : 'Invoked'} lambdas`,
		doneIn === null
			? `${Math.round(
					totalLambdas === null ? 0 : (lambdasInvoked / totalLambdas) * 100
			  )}%`
			: CliInternals.chalk.gray(`${doneIn}ms`),
	].join(' ');
};

export const makeChunkProgress = (
	chunkProgress: ChunkProgress,
	totalSteps: number
) => {
	const {chunksInvoked, totalChunks, doneIn} = chunkProgress;
	return [
		'🧩',
		`(2/${totalSteps})`,
		CliInternals.makeProgressBar(
			totalChunks === null ? 0 : chunksInvoked / totalChunks
		),
		`${doneIn === null ? 'Rendering' : 'Rendered'} chunks`,
		doneIn === null
			? `${Math.round(
					totalChunks === null ? 0 : (chunksInvoked / totalChunks) * 100
			  )}%`
			: CliInternals.chalk.gray(`${doneIn}ms`),
	].join(' ');
};

export const makeEncodingProgress = (
	encodingProgress: EncodingProgress,
	totalSteps: number
) => {
	const {framesEncoded, totalFrames, doneIn} = encodingProgress;
	return [
		'📽 ',
		`(3/${totalSteps})`,
		CliInternals.makeProgressBar(
			totalFrames === null ? 0 : framesEncoded / totalFrames
		),
		`${doneIn === null ? 'Combining' : 'Combined'} videos`,
		doneIn === null
			? `${Math.round(
					totalFrames === null ? 0 : (framesEncoded / totalFrames) * 100
			  )}%`
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

	const {done, filesDeleted, filesToDelete} = cleanupInfo;
	return [
		'🪣 ',
		`(4/${totalSteps})`,
		CliInternals.makeProgressBar(filesDeleted / filesToDelete),
		`${done ? 'Cleaned up' : 'Cleaning up'} artifacts`,
		done
			? CliInternals.chalk.gray('TODOms')
			: `${Math.round((filesDeleted / filesToDelete) * 100)}%`,
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
			// TODO: Define done in
			doneIn: null,
		},
		encodingProgress: {
			framesEncoded: status.encodingStatus?.framesEncoded ?? 0,
			totalFrames: status.encodingStatus?.totalFrames ?? null,
			// TODO: Define done in
			doneIn: null,
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

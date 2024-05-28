import {CliInternals} from '@remotion/cli';
import {RenderInternals} from '@remotion/renderer';
import {NoReactInternals} from 'remotion/no-react';
import type {RenderProgress} from '../../../defaults';
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

const makeInvokeProgress = (
	overall: RenderProgress,
	retriesInfo: ChunkRetry[],
) => {
	const invokeProgress: LambdaInvokeProgress = {
		lambdasInvoked: overall.lambdasInvoked,
		totalLambdas:
			overall.renderMetadata?.estimatedRenderLambdaInvokations ?? null,
	};
	const {lambdasInvoked, totalLambdas} = invokeProgress;
	const progress = totalLambdas === null ? 0 : lambdasInvoked / totalLambdas;
	return [
		`${progress === 0 ? 'Invoked' : 'Invoking'} lambdas`.padEnd(
			CliInternals.LABEL_WIDTH,
		),
		CliInternals.makeProgressBar(progress),
		progress === 1
			? CliInternals.chalk.gray(`${lambdasInvoked}/${totalLambdas}`)
			: totalLambdas === null
				? null
				: `${lambdasInvoked}/${totalLambdas}`,
		retriesInfo.length > 0 ? `(+${retriesInfo.length} retries)` : [],
	].join(' ');
};

const makeRenderProgress = (progress: RenderProgress) => {
	const chunkProgress: ChunkProgress = {
		chunksEncoded: progress.chunks,
		totalChunks: progress.renderMetadata?.totalChunks ?? null,
		doneIn: progress.timeToFinishChunks,
		framesRendered: progress.framesRendered,
		framesEncoded: progress.encodingStatus?.framesEncoded ?? 0,
		totalFrames:
			progress.renderMetadata && progress.renderMetadata.type === 'video'
				? RenderInternals.getFramesToRender(
						progress.renderMetadata.frameRange,
						progress.renderMetadata.everyNthFrame,
					).length
				: null,
	};
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

const makeCombinationProgress = ({
	totalFrames,
	progress: prog,
}: {
	progress: RenderProgress;
	totalFrames: number | null;
}) => {
	const encodingProgress = {
		framesEncoded: prog.encodingStatus?.framesEncoded ?? 0,
		combinedFrames: prog.combinedFrames,
		timeToCombine: prog.timeToCombine,
	};
	const {combinedFrames, timeToCombine} = encodingProgress;
	const progress = totalFrames === null ? 0 : combinedFrames / totalFrames;

	return [
		`${timeToCombine === null ? 'Combining' : 'Combined'} chunks`.padEnd(
			CliInternals.LABEL_WIDTH,
			' ',
		),
		CliInternals.makeProgressBar(progress),
		timeToCombine === null
			? `${Math.round(progress * 100)}%`
			: CliInternals.chalk.gray(`${timeToCombine}ms`),
	].join(' ');
};

const makeDownloadProgress = (downloadInfo: DownloadedInfo) => {
	return [
		`${downloadInfo.doneIn === null ? 'Downloading' : 'Downloaded'} video`.padEnd(
			CliInternals.LABEL_WIDTH,
			' ',
		),
		downloadInfo.totalSize === null
			? CliInternals.getFileSizeDownloadBar(downloadInfo.downloaded)
			: CliInternals.makeProgressBar(
					downloadInfo.downloaded / downloadInfo.totalSize,
				),
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

type DownloadedInfo = {
	totalSize: number | null;
	downloaded: number;
	doneIn: number | null;
};

export const makeProgressString = ({
	downloadInfo,
	retriesInfo,
	totalFrames,
	overall,
}: {
	overall: RenderProgress;
	downloadInfo: DownloadedInfo | null;
	retriesInfo: ChunkRetry[];
	totalFrames: number | null;
}) => {
	return [
		makeInvokeProgress(overall, retriesInfo),
		...makeRenderProgress(overall),
		makeCombinationProgress({
			progress: overall,
			totalFrames,
		}),
		downloadInfo ? makeDownloadProgress(downloadInfo) : null,
	]
		.filter(NoReactInternals.truthy)
		.join('\n');
};

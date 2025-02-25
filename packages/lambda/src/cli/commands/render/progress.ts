import {CliInternals} from '@remotion/cli';
import type {RenderProgress} from '@remotion/lambda-client/constants';
import {RenderInternals} from '@remotion/renderer';
import type {CloudProvider, ReceivedArtifact} from '@remotion/serverless';
import {truthy} from '@remotion/serverless';
import {NoReactInternals} from 'remotion/no-react';

type LambdaInvokeProgress = {
	totalLambdas: number | null;
	lambdasInvoked: number;
};

const makeEvaluationProgress = (overall: RenderProgress) => {
	const timeToLaunch = overall.compositionValidated
		? overall.compositionValidated - overall.functionLaunched
		: null;

	if (timeToLaunch) {
		return [
			`Got composition`.padEnd(CliInternals.LABEL_WIDTH),
			CliInternals.makeProgressBar(1, false),
			CliInternals.chalk.gray(`${timeToLaunch}ms`),
		].join(' ');
	}

	if (overall.serveUrlOpened) {
		return [
			`Calculating metadata`.padEnd(CliInternals.LABEL_WIDTH),
			CliInternals.makeProgressBar(0.5, false),
			`${overall.currentTime - overall.serveUrlOpened}ms`,
		].join(' ');
	}

	return [
		`Visiting Site`.padEnd(CliInternals.LABEL_WIDTH),
		CliInternals.makeProgressBar(0, false),
		`${overall.currentTime - overall.functionLaunched}ms`,
	].join(' ');
};

const makeInvokeProgress = (overall: RenderProgress) => {
	const invokeProgress: LambdaInvokeProgress = {
		lambdasInvoked: overall.lambdasInvoked,
		totalLambdas:
			overall.renderMetadata?.estimatedRenderLambdaInvokations ?? null,
	};
	const {lambdasInvoked, totalLambdas} = invokeProgress;
	const progress = totalLambdas === null ? 0 : lambdasInvoked / totalLambdas;
	const topLine = [
		`${progress === 0 ? 'Invoked' : 'Invoking'} lambdas`.padEnd(
			CliInternals.LABEL_WIDTH,
		),
		CliInternals.makeProgressBar(progress, false),
		progress === 1
			? CliInternals.chalk.gray(`${lambdasInvoked}/${totalLambdas}`)
			: totalLambdas === null
				? null
				: `${lambdasInvoked}/${totalLambdas}`,
	].join(' ');

	return [
		topLine,
		overall.retriesInfo.length > 0
			? `! Retrying chunk${overall.retriesInfo.length === 1 ? '' : 's'} ${overall.retriesInfo.map((r) => r.chunk).join(', ')}`
			: null,
	].filter(NoReactInternals.truthy);
};

const makeRenderProgress = (progress: RenderProgress) => {
	const framesEncoded = progress.encodingStatus?.framesEncoded ?? 0;
	const totalFrames =
		progress.renderMetadata && progress.renderMetadata.type === 'video'
			? RenderInternals.getFramesToRender(
					progress.renderMetadata.frameRange,
					progress.renderMetadata.everyNthFrame,
				).length
			: null;
	const renderProgress =
		totalFrames === null ? 0 : progress.framesRendered / totalFrames;
	const encodingProgress =
		totalFrames === null ? 0 : framesEncoded / totalFrames;

	const frames =
		totalFrames === null ? null : `${progress.framesRendered}/${totalFrames}`;

	const first = [
		(progress.timeToRenderFrames === null
			? 'Rendering frames'
			: 'Rendered frames'
		).padEnd(CliInternals.LABEL_WIDTH, ' '),
		CliInternals.makeProgressBar(renderProgress, false),
		progress.timeToRenderFrames === null
			? frames
			: CliInternals.chalk.gray(`${progress.timeToRenderFrames}ms`),
	]
		.filter(truthy)
		.join(' ');

	const second = [
		`${progress.timeToEncode === null ? 'Encoding' : 'Encoded'} frames`.padEnd(
			CliInternals.LABEL_WIDTH,
			' ',
		),
		CliInternals.makeProgressBar(encodingProgress, false),
		progress.timeToEncode === null
			? totalFrames === null
				? null
				: `${framesEncoded}/${totalFrames}`
			: CliInternals.chalk.gray(`${progress.timeToEncode}ms`),
	]
		.filter(truthy)
		.join(' ');

	return [first, second];
};

function getTotalFrames(status: RenderProgress): number | null {
	return status.renderMetadata && status.renderMetadata.type === 'video'
		? RenderInternals.getFramesToRender(
				status.renderMetadata.frameRange,
				status.renderMetadata.everyNthFrame,
			).length
		: null;
}

const makeCombinationProgress = (prog: RenderProgress) => {
	const encodingProgress = {
		framesEncoded: prog.encodingStatus?.framesEncoded ?? 0,
		combinedFrames: prog.combinedFrames,
		timeToCombine: prog.timeToCombine,
	};
	const totalFrames = getTotalFrames(prog);
	const {combinedFrames, timeToCombine} = encodingProgress;
	const progress = totalFrames === null ? 0 : combinedFrames / totalFrames;

	return [
		`${timeToCombine === null ? 'Combining' : 'Combined'} chunks`.padEnd(
			CliInternals.LABEL_WIDTH,
			' ',
		),
		CliInternals.makeProgressBar(progress, false),
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
					false,
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

const makeTopRow = (overall: RenderProgress) => {
	const timeoutInSeconds = Math.round(
		(overall.timeoutTimestamp - Date.now()) / 1000,
	);

	if (overall.done) {
		return null;
	}

	const str = [
		`${Math.round(overall.overallProgress * 100)}%`,
		overall.renderMetadata
			? `${overall.renderMetadata.estimatedTotalLambdaInvokations} λ`
			: null,
		`${overall.costs.displayCost}`,
		timeoutInSeconds < 0
			? `${CliInternals.chalk.red('Timeout reached')} - Expecting crash shortly`
			: `Timeout ${timeoutInSeconds}s`,
	]
		.filter(NoReactInternals.truthy)
		.join(' • ');

	return CliInternals.chalk.gray(str);
};

export const makeArtifactProgress = <Provider extends CloudProvider>(
	artifactProgress: ReceivedArtifact<Provider>[],
) => {
	if (artifactProgress.length === 0) {
		return null;
	}

	return artifactProgress
		.map((artifact) => {
			return [
				// TODO: Whitelabel S3
				CliInternals.chalk.blue(`+ S3`.padEnd(CliInternals.LABEL_WIDTH)),
				CliInternals.chalk.blue(
					CliInternals.makeHyperlink({
						url: artifact.s3Url,
						fallback: artifact.filename,
						text: artifact.s3Key,
					}),
				),
				CliInternals.chalk.gray(
					`${CliInternals.formatBytes(artifact.sizeInBytes)}`,
				),
			].join(' ');
		})
		.filter(truthy)
		.join('\n');
};

export const makeProgressString = ({
	downloadInfo,
	overall,
}: {
	overall: RenderProgress;
	downloadInfo: DownloadedInfo | null;
}) => {
	return [
		makeTopRow(overall),
		makeEvaluationProgress(overall),
		...makeInvokeProgress(overall),
		...makeRenderProgress(overall),
		makeCombinationProgress(overall),
		downloadInfo ? makeDownloadProgress(downloadInfo) : null,
		makeArtifactProgress(overall.artifacts),
	]
		.filter(NoReactInternals.truthy)
		.join('\n');
};

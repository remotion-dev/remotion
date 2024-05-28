import {RenderInternals} from '@remotion/renderer';
import type {AwsRegion} from '../../client';
import type {PostRenderData, RenderMetadata} from '../../shared/constants';
import {overallProgressKey} from '../../shared/constants';
import type {ParsedTiming} from '../../shared/parse-lambda-timings-key';
import type {ChunkRetry} from './get-retry-stats';
import {lambdaWriteFile} from './io';
import type {LambdaErrorInfo} from './write-lambda-error';

export type OverallRenderProgress = {
	chunks: number[];
	framesRendered: number;
	framesEncoded: number;
	combinedFrames: number;
	timeToCombine: number | null;
	timeToEncode: number | null;
	timeToRenderFrames: number | null;
	lambdasInvoked: number;
	retries: ChunkRetry[];
	postRenderData: PostRenderData | null;
	timings: ParsedTiming[];
	renderMetadata: RenderMetadata | null;
	errors: LambdaErrorInfo[];
	timeoutTimestamp: number;
};

export type OverallProgressHelper = {
	upload: () => Promise<void>;
	setFrames: ({
		encoded,
		rendered,
		index,
	}: {
		rendered: number;
		encoded: number;
		index: number;
	}) => void;
	setLambdaInvoked: (chunk: number) => void;
	addChunkCompleted: (
		chunkIndex: number,
		start: number,
		rendered: number,
	) => void;
	setCombinedFrames: (framesEncoded: number) => void;
	setTimeToCombine: (timeToCombine: number) => void;
	addRetry: (retry: ChunkRetry) => void;
	setPostRenderData: (postRenderData: PostRenderData) => void;
	setRenderMetadata: (renderMetadata: RenderMetadata) => void;
	addErrorWithoutUpload: (errorInfo: LambdaErrorInfo) => void;
	setExpectedChunks: (expectedChunks: number) => void;
	get: () => OverallRenderProgress;
};

export const makeInitialOverallRenderProgress = (
	timeoutTimestamp: number,
): OverallRenderProgress => {
	return {
		chunks: [],
		framesRendered: 0,
		framesEncoded: 0,
		combinedFrames: 0,
		timeToCombine: null,
		timeToEncode: null,
		lambdasInvoked: 0,
		retries: [],
		postRenderData: null,
		timings: [],
		renderMetadata: null,
		errors: [],
		timeToRenderFrames: null,
		timeoutTimestamp,
	};
};

export const makeOverallRenderProgress = ({
	renderId,
	bucketName,
	expectedBucketOwner,
	region,
	timeoutTimestamp,
}: {
	renderId: string;
	bucketName: string;
	expectedBucketOwner: string;
	region: AwsRegion;
	timeoutTimestamp: number;
}): OverallProgressHelper => {
	let framesRendered: number[] = [];
	let framesEncoded: number[] = [];
	let lambdasInvoked: boolean[] = [];

	const renderProgress: OverallRenderProgress =
		makeInitialOverallRenderProgress(timeoutTimestamp);

	let currentUploadPromise: Promise<void> | null = null;

	const getCurrentProgress = () => renderProgress;

	let latestUploadRequest = 0;
	const getLatestRequestId = () => latestUploadRequest;

	let encodeStartTime: number | null = null;
	let renderFramesStartTime: number | null = null;

	// TODO: What if upload fails?
	const upload = async () => {
		const uploadRequestId = ++latestUploadRequest;
		if (currentUploadPromise) {
			await currentUploadPromise;
		}

		const toWrite = JSON.stringify(getCurrentProgress());

		// Deduplicate two fast incoming requests
		await new Promise<void>((resolve) => {
			setImmediate(() => resolve());
		});

		// If request has been replaced by a new one
		if (getLatestRequestId() !== uploadRequestId) {
			return;
		}

		const start = Date.now();
		currentUploadPromise = lambdaWriteFile({
			body: toWrite,
			bucketName,
			customCredentials: null,
			downloadBehavior: null,
			expectedBucketOwner,
			key: overallProgressKey(renderId),
			privacy: 'private',
			region,
		}).then(() => {
			// By default, upload is way too fast (~20 requests per second)
			// Space out the requests a bit
			return new Promise<void>((resolve) => {
				setTimeout(resolve, 500 - (Date.now() - start));
			});
		});
		await currentUploadPromise;
		currentUploadPromise = null;
	};

	return {
		upload,
		setFrames: ({
			encoded,
			rendered,
			index,
		}: {
			rendered: number;
			encoded: number;
			index: number;
		}) => {
			if (framesRendered.length === 0) {
				throw new Error('Expected chunks to be set before frames are set');
			}

			if (framesEncoded.length === 0) {
				throw new Error('Expected chunks to be set before frames are set');
			}

			framesRendered[index] = rendered;
			framesEncoded[index] = encoded;

			const totalFramesEncoded = framesEncoded.reduce((a, b) => a + b, 0);
			const totalFramesRendered = framesRendered.reduce((a, b) => a + b, 0);
			if (renderProgress.framesEncoded === 0 && totalFramesEncoded > 0) {
				encodeStartTime = Date.now();
			}

			if (renderProgress.framesRendered === 0 && totalFramesRendered > 0) {
				renderFramesStartTime = Date.now();
			}

			if (renderProgress.timeToRenderFrames === null) {
				const frameCount =
					renderProgress.renderMetadata &&
					renderProgress.renderMetadata.type === 'video'
						? RenderInternals.getFramesToRender(
								renderProgress.renderMetadata.frameRange,
								renderProgress.renderMetadata.everyNthFrame,
							).length
						: null;
				if (frameCount === totalFramesRendered) {
					const timeToRenderFrames =
						Date.now() - (renderFramesStartTime ?? Date.now());
					renderProgress.timeToRenderFrames = timeToRenderFrames;
				}
			}

			renderProgress.framesRendered = totalFramesRendered;
			renderProgress.framesEncoded = totalFramesEncoded;
			upload();
		},
		addChunkCompleted: (chunkIndex, start, rendered) => {
			renderProgress.chunks.push(chunkIndex);
			if (
				renderProgress.chunks.length ===
				renderProgress.renderMetadata?.totalChunks
			) {
				const timeToEncode = Date.now() - (encodeStartTime ?? Date.now());
				renderProgress.timeToEncode = timeToEncode;
			}

			renderProgress.timings.push({
				chunk: chunkIndex,
				start,
				rendered,
			});
			upload();
		},
		setCombinedFrames: (frames: number) => {
			renderProgress.combinedFrames = frames;
			upload();
		},
		setTimeToCombine: (timeToCombine: number) => {
			renderProgress.timeToCombine = timeToCombine;
			upload();
		},
		setLambdaInvoked(chunk) {
			if (lambdasInvoked.length === 0) {
				throw new Error('Expected chunks to be set before lambdas are set');
			}

			lambdasInvoked[chunk] = true;
			renderProgress.lambdasInvoked = lambdasInvoked.reduce(
				(a, b) => a + Number(b),
				0,
			);
			upload();
		},
		setPostRenderData(postRenderData) {
			renderProgress.postRenderData = postRenderData;
			upload();
		},
		setRenderMetadata: (renderMetadata) => {
			renderProgress.renderMetadata = renderMetadata;
			upload();
		},
		addErrorWithoutUpload: (errorInfo) => {
			renderProgress.errors.push(errorInfo);
		},
		setExpectedChunks: (expectedChunks) => {
			framesRendered = new Array(expectedChunks).fill(0);
			framesEncoded = new Array(expectedChunks).fill(0);
			lambdasInvoked = new Array(expectedChunks).fill(false);
		},
		addRetry(retry) {
			renderProgress.retries.push(retry);
			upload();
		},
		get: () => renderProgress,
	};
};

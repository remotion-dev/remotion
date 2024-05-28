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
	lambdasInvoked: number;
	retries: ChunkRetry[];
	postRenderData: PostRenderData | null;
	timings: ParsedTiming[];
	renderMetadata: RenderMetadata | null;
	errors: LambdaErrorInfo[];
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

export const makeInitialOverallRenderProgress = (): OverallRenderProgress => {
	return {
		chunks: [],
		framesRendered: 0,
		framesEncoded: 0,
		combinedFrames: 0,
		timeToCombine: null,
		lambdasInvoked: 0,
		retries: [],
		postRenderData: null,
		timings: [],
		renderMetadata: null,
		errors: [],
	};
};

export const makeOverallRenderProgress = ({
	renderId,
	bucketName,
	expectedBucketOwner,
	region,
}: {
	renderId: string;
	bucketName: string;
	expectedBucketOwner: string;
	region: AwsRegion;
}): OverallProgressHelper => {
	let framesRendered: number[] = [];
	let framesEncoded: number[] = [];
	let lambdasInvoked: boolean[] = [];

	const renderProgress: OverallRenderProgress =
		makeInitialOverallRenderProgress();

	let currentUploadPromise: Promise<void> | null = null;

	let lastUpload: string | null = null;

	// TODO: What if upload fails?
	// TODO: Is there any chance the latest update will not settle?
	const upload = async () => {
		if (lastUpload === JSON.stringify(renderProgress)) {
			return;
		}

		if (currentUploadPromise) {
			currentUploadPromise = currentUploadPromise.then(() => {
				currentUploadPromise = null;
				return upload();
			});
			return;
		}

		currentUploadPromise = lambdaWriteFile({
			body: JSON.stringify(renderProgress),
			bucketName,
			customCredentials: null,
			downloadBehavior: null,
			expectedBucketOwner,
			key: overallProgressKey(renderId),
			privacy: 'private',
			region,
		});
		lastUpload = JSON.stringify(renderProgress);
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

			renderProgress.framesRendered = framesRendered.reduce((a, b) => a + b, 0);
			renderProgress.framesEncoded = framesEncoded.reduce((a, b) => a + b, 0);
			upload();
		},
		addChunkCompleted: (chunkIndex, start, rendered) => {
			renderProgress.chunks.push(chunkIndex);
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

import type {AwsRegion} from '../../client';
import type {PostRenderData} from '../../shared/constants';
import {overallProgressKey} from '../../shared/constants';
import type {ParsedTiming} from '../../shared/parse-lambda-timings-key';
import type {ChunkRetry} from './get-retry-stats';
import {lambdaWriteFile} from './io';

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
	};
};

export const makeOverallRenderProgress = ({
	renderId,
	bucketName,
	expectedBucketOwner,
	region,
	expectedChunks,
}: {
	renderId: string;
	bucketName: string;
	expectedBucketOwner: string;
	region: AwsRegion;
	expectedChunks: number;
}): OverallProgressHelper => {
	const framesRendered = new Array(expectedChunks).fill(0);
	const framesEncoded = new Array(expectedChunks).fill(0);
	const lambdasInvoked = new Array(expectedChunks).fill(0);

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
			lambdasInvoked[chunk] = true;
			renderProgress.lambdasInvoked = lambdasInvoked.reduce((a, b) => a + b, 0);
			upload();
		},
		setPostRenderData(postRenderData) {
			renderProgress.postRenderData = postRenderData;
			upload();
		},
		addRetry(retry) {
			renderProgress.retries.push(retry);
			upload();
		},
		get: () => renderProgress,
	};
};

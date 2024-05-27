import type {AwsRegion} from '../../client';
import {overallProgressKey} from '../../shared/constants';
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
	addChunkCompleted: (chunkIndex: number) => void;
	setCombinedFrames: (framesEncoded: number) => void;
	setTimeToCombine: (timeToCombine: number) => void;
	addRetry: (retry: ChunkRetry) => void;
	get: () => OverallRenderProgress;
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

	const renderProgress: OverallRenderProgress = {
		chunks: [],
		framesRendered: 0,
		framesEncoded: 0,
		combinedFrames: 0,
		timeToCombine: null,
		lambdasInvoked: 0,
		retries: [],
	};

	let currentUploadPromise: Promise<void> | null = null;

	let lastUpload: string | null = null;

	// TODO: What if upload fails?
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
		addChunkCompleted: (chunkIndex) => {
			renderProgress.chunks.push(chunkIndex);
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
		addRetry(retry) {
			renderProgress.retries.push(retry);
			upload();
		},
		get: () => renderProgress,
	};
};

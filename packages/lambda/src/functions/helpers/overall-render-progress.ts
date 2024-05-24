import type {AwsRegion} from '../../client';
import {overallProgressKey} from '../../shared/constants';
import {lambdaWriteFile} from './io';

export type OverallRenderProgress = {
	chunks: number[];
	framesRendered: number;
	framesEncoded: number;
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
}) => {
	const renderProgress: OverallRenderProgress = {
		chunks: [],
		framesRendered: 0,
		framesEncoded: 0,
	};

	let currentUploadPromise: Promise<void> | null = null;

	let lastUpload: string | null = null;
	let stopUploading = false;
	const finishUploading = () => {
		stopUploading = true;
	};

	const upload = async () => {
		if (stopUploading) {
			return;
		}

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
		await currentUploadPromise;
		lastUpload = JSON.stringify(renderProgress);
		currentUploadPromise = null;
	};

	return {
		upload,
		finishUploading,
		setFrames: ({encoded, rendered}: {rendered: number; encoded: number}) => {
			renderProgress.framesRendered = rendered;
			renderProgress.framesEncoded = encoded;
			upload();
		},
		setChunks: (chunks: number[]) => {
			renderProgress.chunks = chunks;
			upload();
		},
	};
};

import {RenderInternals} from '@remotion/renderer';
import {createWriteStream} from 'fs';
import path from 'path';
import {getExpectedOutName} from '../functions/helpers/expected-out-name';
import {getRenderMetadata} from '../functions/helpers/get-render-metadata';
import {
	LambdaReadFileProgress,
	lambdaReadFileWithProgress,
} from '../functions/helpers/read-with-progress';
import {AwsRegion} from '../pricing/aws-regions';
import {getAccountId} from '../shared/get-account-id';

type DownloadMediaInput = {
	region: AwsRegion;
	bucketName: string;
	renderId: string;
	outPath: string;
	onProgress?: LambdaReadFileProgress;
};

type DownloadMediaOutput = {
	outputPath: string;
	sizeInBytes: number;
};

export const downloadMedia = async (
	input: DownloadMediaInput
): Promise<DownloadMediaOutput> => {
	const expectedBucketOwner = await getAccountId({
		region: input.region,
	});
	const renderMetadata = await getRenderMetadata({
		bucketName: input.bucketName,
		expectedBucketOwner,
		region: input.region,
		renderId: input.renderId,
	});

	const readable = await lambdaReadFileWithProgress({
		bucketName: input.bucketName,
		expectedBucketOwner,
		key: getExpectedOutName(renderMetadata),
		region: input.region,
		onProgress: input.onProgress ?? (() => undefined),
	});

	const outputPath = path.resolve(process.cwd(), input.outPath);

	RenderInternals.ensureOutputDirectory(outputPath);

	const writeStream = createWriteStream(outputPath);
	let sizeInBytes = 0;
	await new Promise<void>((resolve, reject) => {
		readable
			.on('data', (d) => {
				sizeInBytes += d.length;
			})
			.pipe(writeStream)
			.on('error', (err) => reject(err))
			.on('close', () => resolve());
	});

	return {
		outputPath,
		sizeInBytes,
	};
};

/**
 * @deprecated Renamed to downloadMedia()
 */
export const downloadVideo = downloadMedia;

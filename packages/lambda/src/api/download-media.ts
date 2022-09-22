import {RenderInternals} from '@remotion/renderer';
import path from 'path';
import {getExpectedOutName} from '../functions/helpers/expected-out-name';
import {getCustomOutName} from '../functions/helpers/get-custom-out-name';
import {getRenderMetadata} from '../functions/helpers/get-render-metadata';
import type {LambdaReadFileProgress} from '../functions/helpers/read-with-progress';
import {lambdaDownloadFileWithProgress} from '../functions/helpers/read-with-progress';
import type {AwsRegion} from '../pricing/aws-regions';
import type {CustomCredentials} from '../shared/aws-clients';
import {getAccountId} from '../shared/get-account-id';

export type DownloadMediaInput = {
	region: AwsRegion;
	bucketName: string;
	renderId: string;
	outPath: string;
	onProgress?: LambdaReadFileProgress;
	customCredentials?: CustomCredentials;
};

export type DownloadMediaOutput = {
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

	const outputPath = path.resolve(process.cwd(), input.outPath);
	RenderInternals.ensureOutputDirectory(outputPath);

	const {key, renderBucketName, customCredentials} = getExpectedOutName(
		renderMetadata,
		input.bucketName,
		getCustomOutName({
			renderMetadata,
			customCredentials: input.customCredentials ?? null,
		})
	);

	const {sizeInBytes} = await lambdaDownloadFileWithProgress({
		bucketName: renderBucketName,
		expectedBucketOwner,
		key,
		region: input.region,
		onProgress: input.onProgress ?? (() => undefined),
		outputPath,
		customCredentials,
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

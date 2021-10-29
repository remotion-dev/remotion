import fs, {createWriteStream} from 'fs';
import path from 'path';
import {getExpectedOutName} from '../functions/helpers/expected-out-name';
import {getRenderMetadata} from '../functions/helpers/get-render-metadata';
import {lambdaReadFile} from '../functions/helpers/io';
import {AwsRegion} from '../pricing/aws-regions';
import {getAccountId} from '../shared/get-account-id';

type DownloadVideoInput = {
	region: AwsRegion;
	bucketName: string;
	renderId: string;
	outPath: string;
};

type DownloadVideoOutput = {
	outputPath: string;
	sizeInBytes: number;
};

export const downloadVideo = async (
	input: DownloadVideoInput
): Promise<DownloadVideoOutput> => {
	const expectedBucketOwner = await getAccountId({
		region: input.region,
	});
	const renderMetadata = await getRenderMetadata({
		bucketName: input.bucketName,
		expectedBucketOwner,
		region: input.region,
		renderId: input.renderId,
	});

	const readable = await lambdaReadFile({
		bucketName: input.bucketName,
		expectedBucketOwner,
		key: getExpectedOutName(renderMetadata),
		region: input.region,
	});

	const outputPath = path.resolve(process.cwd(), input.outPath);

	await new Promise<void>((resolve, reject) => {
		readable
			.pipe(createWriteStream(outputPath))
			.on('error', (err) => reject(err))
			.on('close', () => resolve());
	});

	const {size} = await fs.promises.stat(outputPath);
	return {
		outputPath,
		sizeInBytes: size,
	};
};

import {GetObjectCommand} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {CustomCredentials} from '@remotion/serverless/client';
import type {AwsRegion} from '../../regions';
import {getS3Client} from '../../shared/get-s3-client';
import type {AwsProvider} from '../aws-implementation';

export type LambdaReadFileProgress = (progress: {
	totalSize: number;
	downloaded: number;
	percent: number;
}) => unknown;

export const lambdaDownloadFileWithProgress = async ({
	bucketName,
	key,
	region,
	expectedBucketOwner,
	outputPath,
	onProgress,
	customCredentials,
	logLevel,
}: {
	bucketName: string;
	key: string;
	region: AwsRegion;
	expectedBucketOwner: string;
	outputPath: string;
	onProgress: LambdaReadFileProgress;
	customCredentials: CustomCredentials<AwsProvider> | null;
	logLevel: LogLevel;
}): Promise<{sizeInBytes: number; to: string}> => {
	const client = getS3Client(region, customCredentials);
	const command = new GetObjectCommand({
		Bucket: bucketName,
		ExpectedBucketOwner: customCredentials ? undefined : expectedBucketOwner,
		Key: key,
	});

	const presigned = await getSignedUrl(client, command);

	const {to, sizeInBytes} = await RenderInternals.downloadFile({
		url: presigned,
		onProgress: ({downloaded, percent, totalSize}) => {
			// On Lambda, it should always be a number
			onProgress({
				downloaded,
				percent: percent as number,
				totalSize: totalSize as number,
			});
		},
		to: () => outputPath,
		indent: false,
		logLevel,
	});

	return {sizeInBytes, to};
};

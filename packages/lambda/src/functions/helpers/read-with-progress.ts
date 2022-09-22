import {GetObjectCommand} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import {RenderInternals} from '@remotion/renderer';
import type {AwsRegion} from '../../pricing/aws-regions';
import type {CustomCredentials} from '../../shared/aws-clients';
import {getS3Client} from '../../shared/aws-clients';

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
}: {
	bucketName: string;
	key: string;
	region: AwsRegion;
	expectedBucketOwner: string;
	outputPath: string;
	onProgress: LambdaReadFileProgress;
	customCredentials: CustomCredentials | null;
}): Promise<{sizeInBytes: number; to: string}> => {
	const client = getS3Client(region, customCredentials);
	const command = new GetObjectCommand({
		Bucket: bucketName,
		ExpectedBucketOwner: expectedBucketOwner,
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
	});

	return {sizeInBytes, to};
};

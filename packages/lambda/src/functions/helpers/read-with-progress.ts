import {GetObjectCommand} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import {RenderInternals} from '@remotion/renderer';
import type {AwsRegion} from '../../pricing/aws-regions';
import {getS3Client} from '../../shared/aws-clients';

export type LambdaReadFileProgress = (progress: {
	totalSize: number | null;
	downloaded: number;
	percent: number | null;
}) => unknown;

export const lambdaDownloadFileWithProgress = async ({
	bucketName,
	key,
	region,
	expectedBucketOwner,
	outputPath,
	onProgress,
}: {
	bucketName: string;
	key: string;
	region: AwsRegion;
	expectedBucketOwner: string;
	outputPath: string;
	onProgress: LambdaReadFileProgress;
}): Promise<{sizeInBytes: number; to: string}> => {
	const client = getS3Client(region);
	const command = new GetObjectCommand({
		Bucket: bucketName,
		ExpectedBucketOwner: expectedBucketOwner,
		Key: key,
	});

	const presigned = await getSignedUrl(client, command);

	const {to, sizeInBytes} = await RenderInternals.downloadFile({
		url: presigned,
		onProgress,
		to: () => outputPath,
	});

	return {sizeInBytes, to};
};

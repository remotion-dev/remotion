import {GetObjectCommand} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import {
	LambdaClientInternals,
	type AwsRegion,
	type CustomCredentials,
	type RequestHandler,
} from '@remotion/lambda-client';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';

export type LambdaReadFileProgress = (progress: {
	totalSize: number;
	downloaded: number;
	percent: number;
}) => unknown;

type LambdaDownloadFileWithProgressInput = {
	bucketName: string;
	key: string;
	region: AwsRegion;
	expectedBucketOwner: string;
	outputPath: string;
	onProgress: LambdaReadFileProgress;
	customCredentials: CustomCredentials | null;
	logLevel: LogLevel;
	forcePathStyle: boolean;
	requestHandler: RequestHandler;
	abortSignal: AbortSignal;
};

export const lambdaDownloadFileWithProgress = async ({
	bucketName,
	key,
	region,
	expectedBucketOwner,
	outputPath,
	onProgress,
	customCredentials,
	logLevel,
	forcePathStyle,
	requestHandler,
	abortSignal,
}: LambdaDownloadFileWithProgressInput): Promise<{
	sizeInBytes: number;
	to: string;
}> => {
	const client = LambdaClientInternals.getS3Client({
		region,
		customCredentials,
		forcePathStyle,
		requestHandler,
	});
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
		abortSignal,
	});

	return {sizeInBytes, to};
};

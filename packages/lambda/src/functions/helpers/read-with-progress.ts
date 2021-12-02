import {GetObjectCommand} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import {RenderInternals} from '@remotion/renderer';
import {Readable} from 'stream';
import {AwsRegion} from '../../pricing/aws-regions';
import {getS3Client} from '../../shared/aws-clients';

export type LambdaReadFileProgress = (progress: {
	totalSize: number;
	downloaded: number;
	progress: number;
}) => unknown;

export const lambdaReadFileWithProgress = async ({
	bucketName,
	key,
	region,
	expectedBucketOwner,
	onProgress,
}: {
	bucketName: string;
	key: string;
	region: AwsRegion;
	expectedBucketOwner: string;
	onProgress: LambdaReadFileProgress;
}): Promise<Readable> => {
	const client = getS3Client(region);
	const command = new GetObjectCommand({
		Bucket: bucketName,
		ExpectedBucketOwner: expectedBucketOwner,
		Key: key,
	});

	const presigned = await getSignedUrl(client, command);

	const stream = RenderInternals.gotStream(presigned);
	stream.on('downloadProgress', ({percent, transferred, total}) => {
		onProgress({
			downloaded: transferred,
			progress: percent,
			totalSize: total,
		});
	});

	return stream;
};

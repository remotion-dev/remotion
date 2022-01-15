import {GetObjectCommand} from '@aws-sdk/client-s3';
import {Readable} from 'stream';
import {AwsRegion} from '../pricing/aws-regions';
import {getS3Client} from '../shared/aws-clients';
import {REMOTION_BUCKET_PREFIX} from '../shared/constants';

export type GetS3ObjectInput = {
	region: AwsRegion;
	bucketName: string;
	objectKey: string;
};

/**
 * @description Retrieves an object stored in Remotion's S3 bucket.
 * @link https://v3.remotion.dev/docs/lambda/gets3object
 * @param {AwsRegion} params.region The region in which the S3 bucket resides in.
 * @param {string} params.bucketName The name of the bucket to fetch the object from.
 * @param {string} params.objectKey Key of the S3 object to get.
 * @returns {Promise<Readable>} A `stream.Readable` object.
 */
export const getS3Object = async ({
	region,
	bucketName,
	objectKey,
}: GetS3ObjectInput): Promise<Readable> => {
	if (!bucketName.startsWith(REMOTION_BUCKET_PREFIX)) {
		throw new Error(
			`The bucketName parameter must start with ${REMOTION_BUCKET_PREFIX}.`
		);
	}

	const s3Client = getS3Client(region);

	const data = await s3Client.send(
		new GetObjectCommand({
			Bucket: bucketName,
			Key: objectKey,
		})
	);

	return data.Body as Readable;
};

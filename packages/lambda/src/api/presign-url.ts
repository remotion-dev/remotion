import {GetObjectCommand, HeadObjectCommand} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import {AwsRegion} from '../pricing/aws-regions';
import {getS3Client} from '../shared/aws-clients';
import {REMOTION_BUCKET_PREFIX} from '../shared/constants';

export type PresignURLInput = {
	region: AwsRegion;
	bucketName: string;
	objectKey: string;
	checkIfObjectExists?: boolean;
	expiresIn?: number;
};

/**
 * @description Returns a public url of an object stored in Remotion's S3 bucket.
 * @link https://v3.remotion.dev/docs/lambda/presignurl
 * @param {AwsRegion} params.region The region in which the S3 bucket resides in.
 * @param {string} params.bucketName The name of the bucket to fetch the object from.
 * @param {string} params.objectKey Key of the S3 object to get.
 * @param {string} params.expiresIn The number of seconds before the presigned URL expires. Default 120.
 * @param {boolean} params.checkIfObjectExists Whether the function should check if the object exists in the bucket before generating the presigned url.
 * @returns {Promise<string | null>} The public url of an object or `null` if `checkIfObjectExists=true` & object does not exist.
 */
export const presignUrl = async ({
	region,
	bucketName,
	objectKey,
	checkIfObjectExists = false,
	expiresIn = 120,
}: PresignURLInput): Promise<string | null> => {
	if (!bucketName.startsWith(REMOTION_BUCKET_PREFIX)) {
		throw new Error(
			`The bucketName parameter must start with ${REMOTION_BUCKET_PREFIX}.`
		);
	}

	const s3Client = getS3Client(region);

	const params = {
		Bucket: bucketName,
		Key: objectKey,
	};

	if (checkIfObjectExists) {
		try {
			await s3Client.send(new HeadObjectCommand(params));
		} catch (err) {
			if ((err as {name: string}).name === 'NotFound') {
				return null;
			}

			throw err;
		}
	}

	const objCommand = new GetObjectCommand(params);

	const publicUrl = await getSignedUrl(s3Client, objCommand, {
		expiresIn,
	});

	return publicUrl;
};

import {GetObjectCommand, HeadObjectCommand} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import type {AwsRegion} from '../pricing/aws-regions';
import {getS3Client} from '../shared/aws-clients';
import {validateBucketName} from '../shared/validate-bucketname';
import {validatePresignExpiration} from '../shared/validate-presign-expiration';

type PresignURLInput = {
	region: AwsRegion;
	bucketName: string;
	objectKey: string;
	checkIfObjectExists?: boolean;
	expiresInSeconds: number;
};

/**
 * @description Returns a public url of an object stored in Remotion's S3 bucket.
 * @link https://remotion.dev/docs/lambda/presignurl
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
	expiresInSeconds,
}: PresignURLInput): Promise<string | null> => {
	validateBucketName(bucketName, {mustStartWithRemotion: false});
	validatePresignExpiration(expiresInSeconds);

	const s3Client = getS3Client(region);

	if (checkIfObjectExists) {
		try {
			await s3Client.send(
				new HeadObjectCommand({
					Bucket: bucketName,
					Key: objectKey,
				})
			);
		} catch (err) {
			if ((err as {name: string}).name === 'NotFound') {
				return null;
			}

			if (
				(err as Error).message === 'UnknownError' ||
				(err as {$metadata: {httpStatusCode: number}}).$metadata
					.httpStatusCode === 403
			) {
				throw new Error(
					`Unable to access item "${objectKey}" from bucket "${bucketName}". You must have permission for both "s3:GetObject" and "s3:ListBucket" actions.`
				);
			}

			throw err;
		}
	}

	const objCommand = new GetObjectCommand({
		Bucket: bucketName,
		Key: objectKey,
	});

	const publicUrl = await getSignedUrl(s3Client, objCommand, {
		expiresIn: expiresInSeconds,
	});

	return publicUrl;
};

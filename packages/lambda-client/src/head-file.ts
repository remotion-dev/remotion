import {HeadObjectCommand} from '@aws-sdk/client-s3';
import type {HeadFile} from './aws-operations';
import {OutputFileAccessDeniedError} from './find-output-file-in-bucket';
import {getS3Client} from './get-s3-client';

export const lambdaHeadFileImplementation: HeadFile = async ({
	bucketName,
	key,
	region,
	customCredentials,
	forcePathStyle,
	requestHandler,
}): Promise<{
	LastModified?: Date | undefined;
	ContentLength?: number | undefined;
	Metadata?: Record<string, string> | undefined;
}> => {
	try {
		const head = await getS3Client({
			region,
			customCredentials,
			forcePathStyle,
			requestHandler,
		}).send(
			new HeadObjectCommand({
				Bucket: bucketName,
				Key: key,
			}),
		);
		return head;
	} catch (err) {
		if (
			(err as Error).message === 'UnknownError' ||
			(err as {$metadata: {httpStatusCode: number}}).$metadata
				?.httpStatusCode === 403
		) {
			const ErrorClass =
				(err as {$metadata: {httpStatusCode: number} | undefined}).$metadata
					?.httpStatusCode === 403
					? OutputFileAccessDeniedError
					: Error;
			throw new ErrorClass(
				`Unable to access item "${key}" from bucket "${bucketName}" ${
					customCredentials?.endpoint
						? `(S3 Endpoint = ${customCredentials?.endpoint})`
						: ''
				} - got a 403 error when heading the file. Check your credentials and permissions. The Lambda role must have permission for both "s3:GetObject" and "s3:ListBucket" actions.`,
				{cause: err},
			);
		}

		throw err;
	}
};

import {HeadObjectCommand} from '@aws-sdk/client-s3';
import {OutputFileAccessDeniedError} from '@remotion/serverless-client';
import type {ProviderSpecifics} from '@remotion/serverless-client';
import type {AwsProvider} from './aws-provider';
import {getS3Client} from './get-s3-client';

export const lambdaHeadFileImplementation: ProviderSpecifics<AwsProvider>['headFile'] =
	async ({
		bucketName,
		key,
		region,
		customCredentials,
		forcePathStyle,
		requestHandler,
	}): Promise<{
		renderId: string | null;
		LastModified?: Date | undefined;
		ContentLength?: number | undefined;
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
			return {...head, renderId: head.Metadata?.['remotion-render-id'] ?? null};
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

import {HeadObjectCommand} from '@aws-sdk/client-s3';
import type {AwsRegion} from '../..';
import {ROLE_NAME} from '../../api/iam-validation/suggested-policy';
import {getS3Client} from '../../shared/aws-clients';
import type {RenderMetadata} from '../../shared/constants';
import {getExpectedOutName} from './expected-out-name';
import {getOutputUrlFromMetadata} from './get-output-url-from-metadata';

export type OutputFileMetadata = {
	url: string;
	size: number;
	lastModified: number;
};

export const findOutputFileInBucket = async ({
	region,
	renderMetadata,
	bucketName,
}: {
	region: AwsRegion;
	renderMetadata: RenderMetadata;
	bucketName: string;
}): Promise<OutputFileMetadata | null> => {
	if (!renderMetadata) {
		throw new Error('unexpectedly did not get renderMetadata');
	}

	const expectedOutData = getExpectedOutName(renderMetadata, bucketName);

	try {
		const head = await getS3Client(region, null).send(
			new HeadObjectCommand({
				Bucket: expectedOutData.renderBucketName,
				Key: expectedOutData.key,
			})
		);
		return {
			lastModified: head.LastModified?.getTime() as number,
			size: head.ContentLength as number,
			url: getOutputUrlFromMetadata(renderMetadata, bucketName),
		};
	} catch (err) {
		if ((err as Error).name === 'NotFound') {
			return null;
		}

		if (
			(err as Error).message === 'UnknownError' ||
			(err as {$metadata: {httpStatusCode: number}}).$metadata
				.httpStatusCode === 403
		) {
			throw new Error(
				`Unable to access item "${expectedOutData.key}" from bucket "${expectedOutData.renderBucketName}". The "${ROLE_NAME}" role must have permission for both "s3:GetObject" and "s3:ListBucket" actions.`
			);
		}

		throw err;
	}
};

import {HeadObjectCommand} from '@aws-sdk/client-s3';
import type {AwsRegion} from '../..';
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
		const head = await getS3Client(region).send(
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
		if ((err as {name: string}).name === 'NotFound') {
			return null;
		}

		if ((err as Error).stack?.includes('UnknownError')) {
			console.log('got unknown error', {expectedOutData});
			return null;
		}

		throw err;
	}
};

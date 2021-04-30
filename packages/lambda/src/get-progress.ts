import {ListObjectsV2Command} from '@aws-sdk/client-s3';
import {s3Client} from './aws-clients';
import {LambdaPayload} from './constants';

export const progressHandler = async (lambdaParams: LambdaPayload) => {
	if (lambdaParams.type !== 'status') {
		throw new TypeError('Expected status type');
	}
	const list = await s3Client.send(
		new ListObjectsV2Command({
			Bucket: lambdaParams.bucketName,
		})
	);
	const contents = list.Contents ?? [];
	if (!contents) {
		throw new Error('Could not get list contents');
	}

	const chunks = contents.filter((c) => c.Key?.match(/chunk(.*).mp4/));

	return {
		chunks: chunks.length,
	};
};

import {GetObjectCommand, ListObjectsV2Command} from '@aws-sdk/client-s3';
import {Readable} from 'stream';
import {s3Client} from './aws-clients';
import {
	EncodingProgress,
	ENCODING_PROGRESS_KEY,
	LambdaPayload,
	LambdaRoutines,
} from './constants';
import {streamToString} from './stream-to-string';

export const progressHandler = async (lambdaParams: LambdaPayload) => {
	if (lambdaParams.type !== LambdaRoutines.status) {
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
	// TODO: out.mp4 is hardcodec
	const output = contents.find((c) => c.Key?.includes('out.mp4'));

	const framesExists = contents.find((c) => c.Key === ENCODING_PROGRESS_KEY)
		? await s3Client.send(
				new GetObjectCommand({
					Bucket: lambdaParams.bucketName,
					Key: ENCODING_PROGRESS_KEY,
				})
		  )
		: null;

	const frameResponse = framesExists
		? (JSON.parse(
				await streamToString(framesExists.Body as Readable)
		  ) as EncodingProgress)
		: null;

	return {
		chunks: chunks.length,
		done: Boolean(output),
		frameResponse,
	};
};

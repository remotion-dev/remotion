import {GetObjectCommand, ListObjectsV2Command} from '@aws-sdk/client-s3';
import {Readable} from 'stream';
import {s3Client} from './aws-clients';
import {
	EncodingProgress,
	ENCODING_PROGRESS_KEY,
	LambdaPayload,
	LambdaRoutines,
	RenderMetadata,
	RENDER_METADATA_KEY,
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
	const renderMetadataExists = contents.find(
		(c) => c.Key === RENDER_METADATA_KEY
	)
		? await s3Client.send(
				new GetObjectCommand({
					Bucket: lambdaParams.bucketName,
					Key: RENDER_METADATA_KEY,
				})
		  )
		: null;

	const frameResponse = framesExists
		? (JSON.parse(
				await streamToString(framesExists.Body as Readable)
		  ) as EncodingProgress)
		: null;

	const renderMetadataResponse = renderMetadataExists
		? (JSON.parse(
				await streamToString(renderMetadataExists.Body as Readable)
		  ) as RenderMetadata)
		: null;

	return {
		chunks: chunks.length,
		done: Boolean(output),
		frameResponse,
		renderMetadata: renderMetadataResponse,
	};
};

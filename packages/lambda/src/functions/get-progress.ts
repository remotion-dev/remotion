import {_Object} from '@aws-sdk/client-s3';
import {Internals} from 'remotion';
import {
	EncodingProgress,
	ENCODING_PROGRESS_KEY,
	LambdaPayload,
	LambdaRoutines,
	OUT_NAME,
	REGION,
	RenderMetadata,
	RENDER_METADATA_KEY,
} from '../constants';
import {inspectErrors} from '../inspect-errors';
import {lambdaLs, lambdaReadFile} from '../io';
import {streamToString} from '../stream-to-string';

const getFinalEncodingStatus = ({
	encodingStatus: encodingProgress,
	renderMetadata,
	outputFileExists,
}: {
	encodingStatus: EncodingProgress | null;
	renderMetadata: RenderMetadata | null;
	outputFileExists: boolean;
}): EncodingProgress | null => {
	if (!renderMetadata) {
		return null;
	}

	if (outputFileExists) {
		return {
			framesRendered: renderMetadata.totalFrames,
		};
	}

	return encodingProgress;
};

const getEncodingMetadata = async ({
	exists,
	bucketName,
}: {
	exists: boolean;
	bucketName: string;
}): Promise<EncodingProgress | null> => {
	if (!exists) {
		return null;
	}

	const Body = await lambdaReadFile({
		bucketName,
		key: ENCODING_PROGRESS_KEY,
	});

	const encodingProgress = JSON.parse(
		await streamToString(Body)
	) as EncodingProgress;

	return encodingProgress;
};

const getRenderMetadata = async ({
	exists,
	bucketName,
}: {
	exists: boolean;
	bucketName: string;
}) => {
	if (!exists) {
		return null;
	}

	const Body = await lambdaReadFile({
		bucketName,
		key: RENDER_METADATA_KEY,
	});

	const renderMetadataResponse = JSON.parse(
		await streamToString(Body)
	) as RenderMetadata;

	return renderMetadataResponse;
};

const getTimeToFinish = ({
	renderMetadata,
	output,
}: {
	renderMetadata: RenderMetadata | null;
	output: _Object | null;
}) => {
	if (!output) {
		return null;
	}

	if (!output.LastModified) {
		return null;
	}

	if (!renderMetadata) {
		return null;
	}

	return output.LastModified.getTime() - renderMetadata.startedDate;
};

export const progressHandler = async (lambdaParams: LambdaPayload) => {
	if (lambdaParams.type !== LambdaRoutines.status) {
		throw new TypeError('Expected status type');
	}

	const contents = await lambdaLs(lambdaParams.bucketName);

	if (!contents) {
		throw new Error('Could not get list contents');
	}

	const bucketSize = contents
		.map((c) => c.Size ?? 0)
		.reduce((a, b) => a + b, 0);

	const chunks = contents.filter((c) => c.Key?.match(/chunk(.*).mp4/));
	const output = contents.find((c) => c.Key?.includes(OUT_NAME)) ?? null;
	const errors = contents
		// TODO: unhardcode
		.filter(
			(c) =>
				c.Key?.startsWith('error-chunk') || c.Key?.startsWith('error-stitcher')
		)
		.map((c) => c.Key)
		.filter(Internals.truthy);

	const [encodingStatus, renderMetadata, errorExplanations] = await Promise.all(
		[
			getEncodingMetadata({
				exists: Boolean(contents.find((c) => c.Key === ENCODING_PROGRESS_KEY)),
				bucketName: lambdaParams.bucketName,
			}),
			getRenderMetadata({
				exists: Boolean(contents.find((c) => c.Key === RENDER_METADATA_KEY)),
				bucketName: lambdaParams.bucketName,
			}),
			inspectErrors({errs: errors, bucket: lambdaParams.bucketName}),
		]
	);

	return {
		chunks: chunks.length,
		done: Boolean(output),
		encodingStatus: getFinalEncodingStatus({
			encodingStatus,
			outputFileExists: Boolean(output),
			renderMetadata,
		}),
		renderMetadata,
		outputFile: output
			? `https://s3.${REGION}.amazonaws.com/${lambdaParams.bucketName}/${OUT_NAME}`
			: null,
		timeToFinish: getTimeToFinish({
			output,
			renderMetadata,
		}),
		errors,
		errorExplanations,
		currentTime: Date.now(),
		bucketSize,
	};
};

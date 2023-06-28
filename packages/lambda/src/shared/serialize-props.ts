import {getOrCreateBucket} from '../api/get-or-create-bucket';
import type {AwsRegion} from '../client';
import {lambdaReadFile, lambdaWriteFile} from '../functions/helpers/io';
import type {SerializedInputProps} from './constants';
import {defaultPropsKey, inputPropsKey, resolvedPropsKey} from './constants';
import {randomHash} from './random-hash';
import {streamToString} from './stream-to-string';

type PropsType = 'input-props' | 'resolved-props' | 'default-props';

export const serializeOrThrow = (
	inputProps: Record<string, unknown>,
	propsType: PropsType
) => {
	try {
		const payload = JSON.stringify(inputProps);
		return payload;
	} catch (err) {
		throw new Error(
			`Error serializing ${propsType}. Check it has no circular references or reduce the size if the object is big.`
		);
	}
};

export const getNeedsToUpload = (
	type: 'still' | 'video-or-audio',
	stringifiedInputProps: string
) => {
	const MAX_INLINE_PAYLOAD_SIZE = type === 'still' ? 5000000 : 200000;
	if (stringifiedInputProps.length > MAX_INLINE_PAYLOAD_SIZE) {
		console.warn(
			`Warning: The props are over ${Math.round(
				MAX_INLINE_PAYLOAD_SIZE / 1000
			)}KB (${Math.ceil(
				stringifiedInputProps.length / 1024
			)}KB) in size. Uploading them to S3 to circumvent AWS Lambda payload size, which may lead to slowdown.`
		);
		return true;
	}

	return false;
};

export const serializeInputProps = async ({
	stringifiedInputProps,
	region,
	userSpecifiedBucketName,
	propsType,
	needsToUpload,
}: {
	stringifiedInputProps: string;
	region: AwsRegion;
	userSpecifiedBucketName: string | null;
	propsType: PropsType;
	needsToUpload: boolean;
}): Promise<SerializedInputProps> => {
	const hash = randomHash();

	if (needsToUpload) {
		const bucketName =
			userSpecifiedBucketName ??
			(
				await getOrCreateBucket({
					region,
				})
			).bucketName;

		await lambdaWriteFile({
			body: stringifiedInputProps,
			bucketName,
			region,
			customCredentials: null,
			downloadBehavior: null,
			expectedBucketOwner: null,
			key: makeKey(propsType, hash),
			privacy: 'public',
		});

		return {
			type: 'bucket-url',
			hash,
		};
	}

	return {
		type: 'payload',
		payload: stringifiedInputProps,
	};
};

export const deserializeInputProps = async ({
	serialized,
	region,
	bucketName,
	expectedBucketOwner,
	propsType,
}: {
	serialized: SerializedInputProps;
	region: AwsRegion;
	bucketName: string;
	expectedBucketOwner: string;
	propsType: PropsType;
}): Promise<Record<string, unknown>> => {
	if (serialized.type === 'payload') {
		return JSON.parse(serialized.payload);
	}

	try {
		const response = await lambdaReadFile({
			bucketName,
			expectedBucketOwner,
			key: makeKey(propsType, serialized.hash),
			region,
		});

		const body = await streamToString(response);
		const payload = JSON.parse(body);

		return payload;
	} catch (err) {
		throw new Error(
			`Failed to parse input props that were serialized: ${
				(err as Error).stack
			}`
		);
	}
};

const makeKey = (type: PropsType, hash: string): string => {
	if (type === 'input-props') {
		return inputPropsKey(hash);
	}

	if (type === 'default-props') {
		return defaultPropsKey(hash);
	}

	return resolvedPropsKey(hash);
};

import type {LogLevel} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {internalGetOrCreateBucket} from './get-or-create-bucket';
import {inputPropsKey, resolvedPropsKey} from './input-props-keys';
import {randomHashImplementation} from './random-hash';
import {lambdaReadFileImplementation} from './read-file';
import type {AwsRegion} from './regions';
import {
	MAX_STILL_INLINE_PAYLOAD_SIZE,
	MAX_NON_INLINE_PAYLOAD_SIZE_PER_FUNCTION,
} from './shared-constants';
import type {SerializedInputProps} from './shared-constants';
import {streamToString} from './stream-to-string';
import type {RequestHandler} from './types';
import {MAX_WEBHOOK_CUSTOM_DATA_SIZE} from './validate-webhook';
import {lambdaWriteFileImplementation} from './write-file';

type PropsType = 'input-props' | 'resolved-props';

const makeKey = (type: PropsType, hash: string): string => {
	if (type === 'input-props') {
		return inputPropsKey(hash);
	}

	return resolvedPropsKey(hash);
};

export const serializeOrThrow = (
	inputProps: Record<string, unknown>,
	propsType: PropsType,
) => {
	try {
		const payload = NoReactInternals.serializeJSONWithSpecialTypes({
			indent: undefined,
			staticBase: null,
			data: inputProps,
		});
		return payload.serializedString;
	} catch {
		throw new Error(
			`Error serializing ${propsType}. Check it has no circular references or reduce the size if the object is big.`,
		);
	}
};

export const getNeedsToUpload = ({
	type,
	sizes,
}: {
	type: 'still' | 'video-or-audio';
	sizes: number[];
}) => {
	const MARGIN = 5_000 + MAX_WEBHOOK_CUSTOM_DATA_SIZE;
	const MAX_INLINE_PAYLOAD_SIZE =
		(type === 'still'
			? MAX_STILL_INLINE_PAYLOAD_SIZE
			: MAX_NON_INLINE_PAYLOAD_SIZE_PER_FUNCTION) - MARGIN;

	const sizesAlreadyUsed = sizes.reduce((a, b) => a + b);

	if (sizesAlreadyUsed > MAX_INLINE_PAYLOAD_SIZE) {
		// eslint-disable-next-line no-console
		console.warn(
			`Warning: The props are over ${Math.round(
				MAX_INLINE_PAYLOAD_SIZE / 1000,
			)}KB (${Math.ceil(
				sizesAlreadyUsed / 1024,
			)}KB) in size. Uploading them to ${'S3'} to circumvent AWS Lambda payload size, which may lead to slowdown.`,
		);
		return true;
	}

	return false;
};

type CompressInputPropsInput = {
	stringifiedInputProps: string;
	region: AwsRegion;
	userSpecifiedBucketName: string | null;
	propsType: PropsType;
	needsToUpload: boolean;
	forcePathStyle: boolean;
	skipPutAcl: boolean;
	requestHandler: RequestHandler | null;
	logLevel: LogLevel;
};

export const compressInputProps = async ({
	stringifiedInputProps,
	region,
	userSpecifiedBucketName,
	propsType,
	needsToUpload,
	forcePathStyle,
	skipPutAcl,
	requestHandler,
	logLevel,
}: CompressInputPropsInput): Promise<SerializedInputProps> => {
	const hash = randomHashImplementation();

	if (needsToUpload) {
		const bucketName =
			userSpecifiedBucketName ??
			(
				await internalGetOrCreateBucket({
					region,
					enableFolderExpiry: null,
					customCredentials: null,
					forcePathStyle,
					skipPutAcl,
					requestHandler,
					logLevel,
				})
			).bucketName;

		await lambdaWriteFileImplementation({
			body: stringifiedInputProps,
			bucketName,
			region,
			customCredentials: null,
			downloadBehavior: null,
			expectedBucketOwner: null,
			key: makeKey(propsType, hash),
			privacy: 'private',
			forcePathStyle,
			storageClass: null,
			requestHandler,
		});

		return {
			type: 'bucket-url',
			hash,
			bucketName,
		};
	}

	return {
		type: 'payload',
		payload: stringifiedInputProps,
	};
};

type DecompressInputPropsInput = {
	serialized: SerializedInputProps;
	region: AwsRegion;
	bucketName: string;
	expectedBucketOwner: string | null;
	propsType: PropsType;
	forcePathStyle: boolean;
	requestHandler: RequestHandler | null;
};

export const decompressInputProps = async ({
	serialized,
	region,
	bucketName,
	expectedBucketOwner,
	propsType,
	forcePathStyle,
	requestHandler,
}: DecompressInputPropsInput): Promise<string> => {
	if (serialized.type === 'payload') {
		return serialized.payload;
	}

	try {
		const response = await lambdaReadFileImplementation({
			bucketName,
			expectedBucketOwner,
			key: makeKey(propsType, serialized.hash),
			region,
			forcePathStyle,
			requestHandler,
		});

		const body = await streamToString(response);
		const payload = body;

		return payload;
	} catch (err) {
		throw new Error(
			`Failed to parse input props that were serialized: ${
				(err as Error).stack
			}`,
		);
	}
};

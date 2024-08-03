import {NoReactInternals} from 'remotion/no-react';
import type {SerializedInputProps} from './constants';
import {internalGetOrCreateBucket} from './get-or-create-bucket';
import {inputPropsKey, resolvedPropsKey} from './input-props-keys';
import type {ProviderSpecifics} from './provider-implementation';
import type {CloudProvider} from './still';
import {streamToString} from './stream-to-string';
import {MAX_WEBHOOK_CUSTOM_DATA_SIZE} from './validate-webhook';

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
		const payload = NoReactInternals.serializeJSONWithDate({
			indent: undefined,
			staticBase: null,
			data: inputProps,
		});
		return payload.serializedString;
	} catch (err) {
		throw new Error(
			`Error serializing ${propsType}. Check it has no circular references or reduce the size if the object is big.`,
		);
	}
};

export const getNeedsToUpload = (
	type: 'still' | 'video-or-audio',
	sizes: number[],
) => {
	const MARGIN = 5_000 + MAX_WEBHOOK_CUSTOM_DATA_SIZE;
	const MAX_INLINE_PAYLOAD_SIZE =
		(type === 'still' ? 5_000_000 : 200_000) - MARGIN;

	const sizesAlreadyUsed = sizes.reduce((a, b) => a + b);

	if (sizesAlreadyUsed > MAX_INLINE_PAYLOAD_SIZE) {
		console.warn(
			`Warning: The props are over ${Math.round(
				MAX_INLINE_PAYLOAD_SIZE / 1000,
			)}KB (${Math.ceil(
				sizesAlreadyUsed / 1024,
			)}KB) in size. Uploading them to S3 to circumvent AWS Lambda payload size, which may lead to slowdown.`,
		);
		return true;
	}

	return false;
};

export const compressInputProps = async <Provider extends CloudProvider>({
	stringifiedInputProps,
	region,
	userSpecifiedBucketName,
	propsType,
	needsToUpload,
	providerSpecifics,
}: {
	stringifiedInputProps: string;
	region: Provider['region'];
	userSpecifiedBucketName: string | null;
	propsType: PropsType;
	needsToUpload: boolean;
	providerSpecifics: ProviderSpecifics<Provider>;
}): Promise<SerializedInputProps> => {
	const hash = providerSpecifics.randomHash();

	if (needsToUpload) {
		const bucketName =
			userSpecifiedBucketName ??
			(
				await internalGetOrCreateBucket({
					region,
					enableFolderExpiry: null,
					customCredentials: null,
					providerSpecifics,
				})
			).bucketName;

		await providerSpecifics.writeFile({
			body: stringifiedInputProps,
			bucketName,
			region,
			customCredentials: null,
			downloadBehavior: null,
			expectedBucketOwner: null,
			key: makeKey(propsType, hash),
			privacy: 'private',
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

export const decompressInputProps = async <Provider extends CloudProvider>({
	serialized,
	region,
	bucketName,
	expectedBucketOwner,
	propsType,
	providerSpecifics,
}: {
	serialized: SerializedInputProps;
	region: Provider['region'];
	bucketName: string;
	expectedBucketOwner: string;
	propsType: PropsType;
	providerSpecifics: ProviderSpecifics<Provider>;
}): Promise<string> => {
	if (serialized.type === 'payload') {
		return serialized.payload;
	}

	try {
		const response = await providerSpecifics.readFile({
			bucketName,
			expectedBucketOwner,
			key: makeKey(propsType, serialized.hash),
			region,
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

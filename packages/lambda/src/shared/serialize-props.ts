import { RenderInternals } from '@remotion/renderer';
import {getOrCreateBucket} from '../api/get-or-create-bucket';
import type {AwsRegion} from '../client';
import {lambdaReadFile, lambdaWriteFile} from '../functions/helpers/io';
import {defaultPropsKey, inputPropsKey, resolvedPropsKey, type SerializedInputProps} from './constants';
import {randomHash} from './random-hash';
import {streamToString} from './stream-to-string';

type PropsType = 'input-props' | 'resolved-props' | 'default-props';

export const serializeInputProps = async ({
	inputProps,
	region,
	type,
	userSpecifiedBucketName,
	propsType
}: {
	inputProps: Record<string, unknown>;
	region: AwsRegion;
	type: 'still' | 'video-or-audio';
	userSpecifiedBucketName: string | null;
	propsType: PropsType;
}): Promise<SerializedInputProps> => {
	try {
		const payload = JSON.stringify(inputProps);
		const hash = randomHash();

		const MAX_INLINE_PAYLOAD_SIZE = type === 'still' ? 5000000 : 200000;
		
		// TODO: It should take the COMBINED size of default props and resolved props
		if (payload.length > MAX_INLINE_PAYLOAD_SIZE) {
			RenderInternals.Log.warn(
				`Warning: inputProps are over ${Math.round(
					MAX_INLINE_PAYLOAD_SIZE / 1000
				)}KB (${Math.ceil(
					payload.length / 1024
				)}KB) in size. Uploading them to S3 to circumvent AWS Lambda payload size.`
			);
			const bucketName =
				userSpecifiedBucketName ??
				(
					await getOrCreateBucket({
						region,
					})
				).bucketName;

			await lambdaWriteFile({
				body: payload,
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
			payload,
		};
	} catch (err) {
		throw new Error(
			`Error serializing ${propsType}. Check it has no circular references or reduce the size if the object is big.`
		);
	}
};

export const deserializeInputProps = async ({
	serialized,
	region,
	bucketName,
	expectedBucketOwner,
	propsType
}: {
	serialized: SerializedInputProps;
	region: AwsRegion;
	bucketName: string;
	expectedBucketOwner: string;
	propsType: PropsType;
}): Promise<Record<string, unknown>> => {
	if (serialized.type === 'payload') {
		return JSON.parse(serialized.payload as string);
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

}

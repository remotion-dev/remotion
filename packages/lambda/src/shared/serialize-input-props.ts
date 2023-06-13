import {getOrCreateBucket} from '../api/get-or-create-bucket';
import type {AwsRegion} from '../client';
import {lambdaWriteFile} from '../functions/helpers/io';
import type {SerializedInputProps} from './constants';
import {inputPropsKey} from './constants';
import {randomHash} from './random-hash';

export const serializeInputProps = async ({
	inputProps = {},
	region,
	type,
	userSpecifiedBucketName,
}: {
	inputProps: Record<string, unknown>;
	region: AwsRegion;
	type: 'still' | 'video-or-audio';
	userSpecifiedBucketName: string | null;
}): Promise<SerializedInputProps> => {
	try {
		const payload = JSON.stringify(inputProps);
		const hash = randomHash();

		const MAX_INLINE_PAYLOAD_SIZE = type === 'still' ? 5000000 : 200000;

		if (payload.length > MAX_INLINE_PAYLOAD_SIZE) {
			console.warn(
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
				key: inputPropsKey(hash),
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
			'Error serializing inputProps. Check it has no circular references or reduce the size if the object is big.'
		);
	}
};

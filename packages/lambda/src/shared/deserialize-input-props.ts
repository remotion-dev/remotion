import type {AwsRegion} from '../client';
import {lambdaReadFile} from '../functions/helpers/io';
import type {SerializedInputProps} from './constants';
import {inputPropsKey} from './constants';
import {streamToString} from './stream-to-string';

export const deserializeInputProps = async ({
	serialized,
	region,
	bucketName,
	expectedBucketOwner,
}: {
	serialized: SerializedInputProps;
	region: AwsRegion;
	bucketName: string;
	expectedBucketOwner: string;
}): Promise<Record<string, unknown>> => {
	if (serialized.type === 'payload') {
		return JSON.parse(serialized.payload as string);
	}

	try {
		const response = await lambdaReadFile({
			bucketName,
			expectedBucketOwner,
			key: inputPropsKey(serialized.hash),
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

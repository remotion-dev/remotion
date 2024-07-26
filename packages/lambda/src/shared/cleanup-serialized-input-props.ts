import type {SerializedInputProps} from '@remotion/serverless/client';
import type {AwsRegion} from '../client';
import {lambdaDeleteFile} from '../functions/helpers/io';
import {inputPropsKey, resolvedPropsKey} from './constants';

export const cleanupSerializedInputProps = async ({
	serialized,
	region,
}: {
	serialized: SerializedInputProps;
	region: AwsRegion;
}): Promise<number> => {
	if (serialized.type === 'payload') {
		return 0;
	}

	const time = Date.now();
	await lambdaDeleteFile({
		bucketName: serialized.bucketName,
		key: inputPropsKey(serialized.hash),
		region,
		customCredentials: null,
	});

	return Date.now() - time;
};

export const cleanupSerializedResolvedProps = async ({
	serialized,
	region,
}: {
	serialized: SerializedInputProps;
	region: AwsRegion;
}): Promise<number> => {
	if (serialized.type === 'payload') {
		return 0;
	}

	const time = Date.now();
	await lambdaDeleteFile({
		bucketName: serialized.bucketName,
		key: resolvedPropsKey(serialized.hash),
		region,
		customCredentials: null,
	});

	return Date.now() - time;
};

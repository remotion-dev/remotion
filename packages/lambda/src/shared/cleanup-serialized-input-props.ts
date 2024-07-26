import {
	inputPropsKey,
	resolvedPropsKey,
	type SerializedInputProps,
} from '@remotion/serverless/client';
import type {AwsRegion} from '../client';
import {lambdaDeleteFile} from '../functions/helpers/io';

export const cleanupSerializedInputProps = async <Region extends string>({
	serialized,
	region,
}: {
	serialized: SerializedInputProps;
	region: Region;
}): Promise<number> => {
	if (serialized.type === 'payload') {
		return 0;
	}

	const time = Date.now();
	await lambdaDeleteFile({
		bucketName: serialized.bucketName,
		key: inputPropsKey(serialized.hash),
		region: region as AwsRegion,
		customCredentials: null,
	});

	return Date.now() - time;
};

export const cleanupSerializedResolvedProps = async <Region extends string>({
	serialized,
	region,
}: {
	serialized: SerializedInputProps;
	region: Region;
}): Promise<number> => {
	if (serialized.type === 'payload') {
		return 0;
	}

	const time = Date.now();
	await lambdaDeleteFile({
		bucketName: serialized.bucketName,
		key: resolvedPropsKey(serialized.hash),
		region: region as AwsRegion,
		customCredentials: null,
	});

	return Date.now() - time;
};

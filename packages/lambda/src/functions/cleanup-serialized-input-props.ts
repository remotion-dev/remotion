import {
	LambdaClientInternals,
	type SerializedInputProps,
	type AwsRegion,
} from '@remotion/lambda-client';

export const cleanupSerializedInputProps = async ({
	serialized,
	region,
	forcePathStyle,
}: {
	serialized: SerializedInputProps;
	region: AwsRegion;
	forcePathStyle: boolean;
}): Promise<number> => {
	if (serialized.type === 'payload') {
		return 0;
	}

	const time = Date.now();
	await LambdaClientInternals.lambdaDeleteFileImplementation({
		bucketName: serialized.bucketName,
		key: LambdaClientInternals.inputPropsKey(serialized.hash),
		region,
		customCredentials: null,
		forcePathStyle,
		requestHandler: null,
	});

	return Date.now() - time;
};

export const cleanupSerializedResolvedProps = async ({
	serialized,
	region,
	forcePathStyle,
}: {
	serialized: SerializedInputProps;
	region: AwsRegion;
	forcePathStyle: boolean;
}): Promise<number> => {
	if (serialized.type === 'payload') {
		return 0;
	}

	const time = Date.now();
	await LambdaClientInternals.lambdaDeleteFileImplementation({
		bucketName: serialized.bucketName,
		key: LambdaClientInternals.resolvedPropsKey(serialized.hash),
		region,
		customCredentials: null,
		forcePathStyle,
		requestHandler: null,
	});

	return Date.now() - time;
};

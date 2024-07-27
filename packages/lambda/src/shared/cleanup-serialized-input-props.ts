import type {ProviderSpecifics} from '@remotion/serverless';
import {
	inputPropsKey,
	resolvedPropsKey,
	type SerializedInputProps,
} from '@remotion/serverless/client';

export const cleanupSerializedInputProps = async <Region extends string>({
	serialized,
	region,
	providerSpecifics,
}: {
	serialized: SerializedInputProps;
	region: Region;
	providerSpecifics: ProviderSpecifics<Region>;
}): Promise<number> => {
	if (serialized.type === 'payload') {
		return 0;
	}

	const time = Date.now();
	await providerSpecifics.deleteFile({
		bucketName: serialized.bucketName,
		key: inputPropsKey(serialized.hash),
		region,
		customCredentials: null,
	});

	return Date.now() - time;
};

export const cleanupSerializedResolvedProps = async <Region extends string>({
	serialized,
	region,
	providerSpecifics,
}: {
	serialized: SerializedInputProps;
	region: Region;
	providerSpecifics: ProviderSpecifics<Region>;
}): Promise<number> => {
	if (serialized.type === 'payload') {
		return 0;
	}

	const time = Date.now();
	await providerSpecifics.deleteFile({
		bucketName: serialized.bucketName,
		key: resolvedPropsKey(serialized.hash),
		region,
		customCredentials: null,
	});

	return Date.now() - time;
};

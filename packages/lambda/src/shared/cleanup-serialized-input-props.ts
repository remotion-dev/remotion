import type {CloudProvider, ProviderSpecifics} from '@remotion/serverless';
import {
	inputPropsKey,
	resolvedPropsKey,
	type SerializedInputProps,
} from '@remotion/serverless/client';

export const cleanupSerializedInputProps = async <
	Provider extends CloudProvider,
>({
	serialized,
	region,
	providerSpecifics,
}: {
	serialized: SerializedInputProps;
	region: Provider['region'];
	providerSpecifics: ProviderSpecifics<Provider>;
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

export const cleanupSerializedResolvedProps = async <
	Provider extends CloudProvider,
>({
	serialized,
	region,
	providerSpecifics,
}: {
	serialized: SerializedInputProps;
	region: Provider['region'];
	providerSpecifics: ProviderSpecifics<Provider>;
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

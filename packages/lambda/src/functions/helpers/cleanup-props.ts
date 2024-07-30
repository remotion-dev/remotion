import type {CloudProvider, ProviderSpecifics} from '@remotion/serverless';
import type {SerializedInputProps} from '@remotion/serverless/client';
import {
	cleanupSerializedInputProps,
	cleanupSerializedResolvedProps,
} from '../../shared/cleanup-serialized-input-props';

export const cleanupProps = <Provider extends CloudProvider>({
	serializedResolvedProps,
	inputProps,
	providerSpecifics,
}: {
	serializedResolvedProps: SerializedInputProps;
	inputProps: SerializedInputProps;
	providerSpecifics: ProviderSpecifics<Provider>;
}): Promise<[number, number]> => {
	const cleanupSerializedInputPropsProm = cleanupSerializedInputProps({
		region: providerSpecifics.getCurrentRegionInFunction(),
		serialized: inputProps,
		providerSpecifics,
	});
	const cleanupResolvedInputPropsProm = cleanupSerializedResolvedProps({
		region: providerSpecifics.getCurrentRegionInFunction(),
		serialized: serializedResolvedProps,
		providerSpecifics,
	});

	return Promise.all([
		cleanupSerializedInputPropsProm,
		cleanupResolvedInputPropsProm,
	]);
};

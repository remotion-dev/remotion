import type {
	CloudProvider,
	ProviderSpecifics,
	SerializedInputProps,
} from '@remotion/serverless-client';
import {
	cleanupSerializedInputProps,
	cleanupSerializedResolvedProps,
} from './cleanup-serialized-input-props';
import type {InsideFunctionSpecifics} from './provider-implementation';

export const cleanupProps = <Provider extends CloudProvider>({
	serializedResolvedProps,
	inputProps,
	providerSpecifics,
	forcePathStyle,
	insideFunctionSpecifics,
}: {
	serializedResolvedProps: SerializedInputProps;
	inputProps: SerializedInputProps;
	providerSpecifics: ProviderSpecifics<Provider>;
	forcePathStyle: boolean;
	insideFunctionSpecifics: InsideFunctionSpecifics<Provider>;
}): Promise<[number, number]> => {
	const cleanupSerializedInputPropsProm = cleanupSerializedInputProps({
		region: insideFunctionSpecifics.getCurrentRegionInFunction(),
		serialized: inputProps,
		providerSpecifics,
		forcePathStyle,
	});
	const cleanupResolvedInputPropsProm = cleanupSerializedResolvedProps({
		region: insideFunctionSpecifics.getCurrentRegionInFunction(),
		serialized: serializedResolvedProps,
		providerSpecifics,
		forcePathStyle,
	});

	return Promise.all([
		cleanupSerializedInputPropsProm,
		cleanupResolvedInputPropsProm,
	]);
};

import {
	cleanupSerializedInputProps,
	cleanupSerializedResolvedProps,
} from './cleanup-serialized-input-props';
import type {SerializedInputProps} from './constants';
import type {
	InsideFunctionSpecifics,
	ProviderSpecifics,
} from './provider-implementation';
import type {CloudProvider} from './types';

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

import {
	cleanupSerializedInputProps,
	cleanupSerializedResolvedProps,
} from './cleanup-serialized-input-props';
import type {SerializedInputProps} from './constants';
import type {ProviderSpecifics} from './provider-implementation';
import type {CloudProvider} from './types';

export const cleanupProps = <Provider extends CloudProvider>({
	serializedResolvedProps,
	inputProps,
	providerSpecifics,
	forcePathStyle,
}: {
	serializedResolvedProps: SerializedInputProps;
	inputProps: SerializedInputProps;
	providerSpecifics: ProviderSpecifics<Provider>;
	forcePathStyle: boolean;
}): Promise<[number, number]> => {
	const cleanupSerializedInputPropsProm = cleanupSerializedInputProps({
		region: providerSpecifics.getCurrentRegionInFunction(),
		serialized: inputProps,
		providerSpecifics,
		forcePathStyle,
	});
	const cleanupResolvedInputPropsProm = cleanupSerializedResolvedProps({
		region: providerSpecifics.getCurrentRegionInFunction(),
		serialized: serializedResolvedProps,
		providerSpecifics,
		forcePathStyle,
	});

	return Promise.all([
		cleanupSerializedInputPropsProm,
		cleanupResolvedInputPropsProm,
	]);
};

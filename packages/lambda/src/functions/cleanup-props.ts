import type {
	ProviderSpecifics,
	SerializedInputProps,
} from '@remotion/lambda-client';
import {
	cleanupSerializedInputProps,
	cleanupSerializedResolvedProps,
} from './cleanup-serialized-input-props';
import type {InsideFunctionSpecifics} from './provider-implementation';

export const cleanupProps = ({
	serializedResolvedProps,
	inputProps,
	providerSpecifics,
	forcePathStyle,
	insideFunctionSpecifics,
}: {
	serializedResolvedProps: SerializedInputProps;
	inputProps: SerializedInputProps;
	providerSpecifics: ProviderSpecifics;
	forcePathStyle: boolean;
	insideFunctionSpecifics: InsideFunctionSpecifics;
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

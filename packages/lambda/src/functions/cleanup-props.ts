import type {SerializedInputProps} from '@remotion/lambda-client';
import {
	cleanupSerializedInputProps,
	cleanupSerializedResolvedProps,
} from './cleanup-serialized-input-props';
import {getCurrentRegionInFunction} from './helpers/get-current-region';

export const cleanupProps = ({
	serializedResolvedProps,
	inputProps,
	forcePathStyle,
}: {
	serializedResolvedProps: SerializedInputProps;
	inputProps: SerializedInputProps;
	forcePathStyle: boolean;
}): Promise<[number, number]> => {
	const cleanupSerializedInputPropsProm = cleanupSerializedInputProps({
		region: getCurrentRegionInFunction(),
		serialized: inputProps,
		forcePathStyle,
	});
	const cleanupResolvedInputPropsProm = cleanupSerializedResolvedProps({
		region: getCurrentRegionInFunction(),
		serialized: serializedResolvedProps,
		forcePathStyle,
	});

	return Promise.all([
		cleanupSerializedInputPropsProm,
		cleanupResolvedInputPropsProm,
	]);
};

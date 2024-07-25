import type {SerializedInputProps} from '../../defaults';
import {
	cleanupSerializedInputProps,
	cleanupSerializedResolvedProps,
} from '../../shared/cleanup-serialized-input-props';
import {getCurrentRegionInFunction} from './get-current-region';

export const cleanupProps = ({
	serializedResolvedProps,
	inputProps,
}: {
	serializedResolvedProps: SerializedInputProps;
	inputProps: SerializedInputProps;
}): Promise<[number, number]> => {
	const cleanupSerializedInputPropsProm = cleanupSerializedInputProps({
		region: getCurrentRegionInFunction(),
		serialized: inputProps,
	});
	const cleanupResolvedInputPropsProm = cleanupSerializedResolvedProps({
		region: getCurrentRegionInFunction(),
		serialized: serializedResolvedProps,
	});

	return Promise.all([
		cleanupSerializedInputPropsProm,
		cleanupResolvedInputPropsProm,
	]);
};

import type {CanUpdateSequencePropStatusTrue} from './use-schema';

export const getEffectiveVisualModeValue = ({
	codeValue,
	dragOverrideValue,
	defaultValue,
	shouldResortToDefaultValueIfUndefined = false,
}: {
	codeValue: CanUpdateSequencePropStatusTrue;
	dragOverrideValue: unknown;
	defaultValue: unknown;
	shouldResortToDefaultValueIfUndefined: boolean;
}) => {
	if (dragOverrideValue !== undefined) {
		return dragOverrideValue;
	}

	if (
		codeValue.codeValue === undefined &&
		shouldResortToDefaultValueIfUndefined
	) {
		return defaultValue;
	}

	return codeValue.codeValue;
};

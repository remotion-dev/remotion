import type {CanUpdateSequencePropStatus} from './use-schema';

export const getEffectiveVisualModeValue = ({
	codeValue,
	runtimeValue,
	dragOverrideValue,
	defaultValue,
	shouldResortToDefaultValueIfUndefined = false,
}: {
	codeValue: CanUpdateSequencePropStatus | null;
	runtimeValue: unknown;
	dragOverrideValue: unknown;
	defaultValue: unknown;
	shouldResortToDefaultValueIfUndefined: boolean;
}) => {
	if (dragOverrideValue !== undefined) {
		return dragOverrideValue;
	}

	if (!codeValue) {
		return runtimeValue;
	}

	if (!codeValue.canUpdate) {
		return runtimeValue;
	}

	if (
		codeValue.codeValue === undefined &&
		shouldResortToDefaultValueIfUndefined
	) {
		return defaultValue;
	}

	return codeValue.codeValue;
};

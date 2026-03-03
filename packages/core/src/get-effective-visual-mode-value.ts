import type {CanUpdateSequencePropStatus} from './use-schema';

export const getEffectiveVisualModeValue = ({
	codeValue,
	runtimeValue,
	dragOverrideValue,
	defaultValue,
}: {
	codeValue: CanUpdateSequencePropStatus | null;
	runtimeValue: unknown;
	dragOverrideValue: unknown;
	defaultValue: unknown;
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

	if (codeValue.codeValue === undefined) {
		return defaultValue;
	}

	return codeValue.codeValue;
};

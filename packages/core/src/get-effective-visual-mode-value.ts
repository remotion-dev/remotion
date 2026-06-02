import type {CanUpdaterSequencePropStatusStatic} from './use-schema';

export const getEffectiveVisualModeValue = ({
	codeValue,
	dragOverrideValue,
	defaultValue,
	shouldResortToDefaultValueIfUndefined = false,
}: {
	codeValue: CanUpdaterSequencePropStatusStatic;
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

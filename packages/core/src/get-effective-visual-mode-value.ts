import type {
	CanUpdateSequencePropStatusStatic,
	DragOverrideValue,
} from './use-schema';

export const getEffectiveVisualModeValue = ({
	codeValue,
	dragOverrideValue,
	defaultValue,
	shouldResortToDefaultValueIfUndefined = false,
}: {
	codeValue: CanUpdateSequencePropStatusStatic;
	dragOverrideValue: DragOverrideValue | undefined;
	defaultValue: unknown;
	shouldResortToDefaultValueIfUndefined: boolean;
}) => {
	if (
		dragOverrideValue !== undefined &&
		dragOverrideValue.type === 'static' &&
		dragOverrideValue.value !== undefined
	) {
		return dragOverrideValue.value;
	}

	if (
		codeValue.codeValue === undefined &&
		shouldResortToDefaultValueIfUndefined
	) {
		return defaultValue;
	}

	return codeValue.codeValue;
};

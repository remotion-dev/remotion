import type {CanUpdateSequencePropStatus} from './use-schema';

type UpdateableSequencePropStatus = Extract<
	CanUpdateSequencePropStatus,
	{canUpdate: true}
>;

export const getEffectiveVisualModeValue = ({
	codeValue,
	dragOverrideValue,
	defaultValue,
	shouldResortToDefaultValueIfUndefined = false,
}: {
	codeValue: UpdateableSequencePropStatus;
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

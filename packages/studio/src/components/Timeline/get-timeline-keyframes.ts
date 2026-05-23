import type {
	CanUpdateSequencePropStatus,
	CanUpdateSequencePropStatusFalse,
} from 'remotion';

export const getComputedStatusLabel = (
	propStatus: CanUpdateSequencePropStatusFalse,
): string => {
	if (propStatus.reason !== 'computed') {
		throw new Error(
			`Unsupported prop status: ${propStatus.reason satisfies never}`,
		);
	}

	return propStatus.keyframes?.length ? 'keyframed' : 'computed';
};

export const getTimelineKeyframes = (
	propStatus: CanUpdateSequencePropStatus | null | undefined,
): {frame: number; value: unknown}[] => {
	if (!propStatus || propStatus.canUpdate) {
		return [];
	}

	if (propStatus.reason !== 'computed') {
		throw new Error(
			`Unsupported prop status: ${propStatus.reason satisfies never}`,
		);
	}

	return propStatus.keyframes ?? [];
};

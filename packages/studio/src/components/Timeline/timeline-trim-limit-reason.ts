export const TIMELINE_TRIM_LIMIT_REASONS = [
	'Keyframe constraint',
	'Computed keyframes',
	'Computed value',
	'Unknown media duration',
	'Minimum duration',
	'Transition limit',
	'Source start',
	'Source end',
	'Parent edge',
	'Composition edge',
	'Adjacent clip',
	'Content end',
	'Trim limit',
] as const;

export type TimelineTrimLimitReason =
	(typeof TIMELINE_TRIM_LIMIT_REASONS)[number];

export const getVisibleTimelineTrimLimitReason = (
	reason: TimelineTrimLimitReason | null,
): TimelineTrimLimitReason | null => {
	return reason === 'Keyframe constraint' ||
		reason === 'Computed keyframes' ||
		reason === 'Computed value' ||
		reason === 'Unknown media duration' ||
		reason === 'Transition limit'
		? reason
		: null;
};

export const getTimelineTrimLimitReason = (
	value: number,
	candidates: readonly (readonly [number, TimelineTrimLimitReason | null])[],
): TimelineTrimLimitReason => {
	return (
		candidates.find(
			([limit, reason]) =>
				reason !== null &&
				Number.isFinite(limit) &&
				Math.abs(value - limit) <=
					Number.EPSILON * Math.max(1, Math.abs(value), Math.abs(limit)) * 8,
		)?.[1] ?? 'Trim limit'
	);
};

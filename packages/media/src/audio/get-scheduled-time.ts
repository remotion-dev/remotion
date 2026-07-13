export const getScheduledTime = ({
	mediaTimestamp,
	targetTime,
	currentTime,
	sequenceStartTime,
}: {
	mediaTimestamp: number;
	targetTime: number;
	currentTime: number;
	sequenceStartTime: number;
}) => {
	const needsTrimStart = mediaTimestamp < sequenceStartTime;

	const offsetBecauseOfTrim = needsTrimStart
		? sequenceStartTime - mediaTimestamp
		: 0;
	const offsetBecauseOfTooLate = targetTime < 0 ? -targetTime : 0;
	const offset = offsetBecauseOfTrim + offsetBecauseOfTooLate;

	const scheduledTime = targetTime + currentTime + offset;

	return scheduledTime;
};

export const getDurationOfNode = ({
	sourceDurationInSeconds,
	sourceOffsetInSeconds,
	offset,
}: {
	sourceDurationInSeconds: number;
	sourceOffsetInSeconds: number;
	offset: number;
}) => {
	// The iterator already clipped the source slice to the media range. If the
	// scheduler starts even later, remove only that additional offset.
	return Math.max(
		0,
		sourceDurationInSeconds - (offset - sourceOffsetInSeconds),
	);
};

export const getTrimStartForAudioNode = ({
	mediaTimestamp,
	targetTime,
	sequenceStartTime,
	combinedPlaybackRate,
	sourceStartOffsetInSeconds,
}: {
	mediaTimestamp: number;
	targetTime: number;
	sequenceStartTime: number;
	combinedPlaybackRate: number;
	sourceStartOffsetInSeconds: number;
}) => {
	const needsTrimStart = mediaTimestamp < sequenceStartTime;

	const offsetBecauseOfTrim = needsTrimStart
		? sequenceStartTime - mediaTimestamp
		: 0;
	const offsetBecauseOfTooLate =
		targetTime < 0 ? -targetTime * combinedPlaybackRate : 0;

	return (
		sourceStartOffsetInSeconds + offsetBecauseOfTrim + offsetBecauseOfTooLate
	);
};

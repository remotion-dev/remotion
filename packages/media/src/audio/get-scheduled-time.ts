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
	bufferDuration,
	loopSegmentMediaEndTimestamp,
	offset,
	originalUnloopedMediaTimestamp,
}: {
	bufferDuration: number;
	loopSegmentMediaEndTimestamp: number;
	offset: number;
	originalUnloopedMediaTimestamp: number;
}) => {
	const originalUnloopedMediaEndTime =
		originalUnloopedMediaTimestamp + bufferDuration;
	const needsTrimEnd =
		originalUnloopedMediaEndTime > loopSegmentMediaEndTimestamp;

	const durationMinusOffset = bufferDuration - offset;

	const duration = needsTrimEnd
		? durationMinusOffset -
			Math.max(0, originalUnloopedMediaEndTime - loopSegmentMediaEndTimestamp)
		: durationMinusOffset;

	return duration;
};

export const getOffset = ({
	mediaTimestamp,
	targetTime,
	sequenceStartTime,
}: {
	mediaTimestamp: number;
	targetTime: number;
	sequenceStartTime: number;
}) => {
	const needsTrimStart = mediaTimestamp < sequenceStartTime;

	const offsetBecauseOfTrim = needsTrimStart
		? sequenceStartTime - mediaTimestamp
		: 0;
	const offsetBecauseOfTooLate = targetTime < 0 ? -targetTime : 0;

	const offset = offsetBecauseOfTrim + offsetBecauseOfTooLate;
	return offset;
};

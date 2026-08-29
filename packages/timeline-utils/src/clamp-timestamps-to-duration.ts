const LAST_FRAME_EPSILON_IN_SECONDS = 1 / 1_000_000;

export const clampTimestampsToDuration = ({
	timestamps,
	durationInSeconds,
}: {
	readonly timestamps: readonly number[];
	readonly durationInSeconds: number | null;
}): number[] => {
	if (durationInSeconds === null) {
		return [...timestamps];
	}

	const lastTimestamp = Math.max(
		0,
		durationInSeconds - LAST_FRAME_EPSILON_IN_SECONDS,
	);

	return timestamps.map((timestamp) => Math.min(timestamp, lastTimestamp));
};

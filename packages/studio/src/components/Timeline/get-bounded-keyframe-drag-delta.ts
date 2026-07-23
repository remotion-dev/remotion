export type TimelineKeyframeDragBoundsTarget = {
	readonly displayFrame: number;
};

export const getBoundedKeyframeDragDelta = ({
	delta,
	durationInFrames,
	targets,
}: {
	readonly delta: number;
	readonly durationInFrames: number;
	readonly targets: readonly TimelineKeyframeDragBoundsTarget[];
}) => {
	if (targets.length === 0 || durationInFrames <= 0) {
		return 0;
	}

	const minDelta = Math.max(...targets.map((target) => -target.displayFrame));
	const maxDelta = Math.min(
		...targets.map((target) => durationInFrames - 1 - target.displayFrame),
	);

	return Math.min(Math.max(delta, minDelta), maxDelta);
};

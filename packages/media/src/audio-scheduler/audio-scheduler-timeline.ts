export const getAudioSchedulerRenderTiming = ({
	startTimeInSeconds,
	durationInSeconds,
	fps,
}: {
	startTimeInSeconds: number;
	durationInSeconds: number;
	fps: number;
}) => {
	return {
		from: startTimeInSeconds * fps,
		durationInFrames: durationInSeconds * fps,
	};
};

export const clampAudioSchedulerTime = ({
	durationInSeconds,
	timeInSeconds,
	fps,
}: {
	durationInSeconds: number;
	timeInSeconds: number;
	fps: number;
}) => {
	const lastValidTime = Math.max(0, durationInSeconds - 1 / fps);
	return Math.min(lastValidTime, Math.max(0, timeInSeconds));
};

export const getAudioSchedulerEntryMountState = ({
	currentTimeInSeconds,
	durationInSeconds,
	parentIsPremounting,
	parentIsPostmounting,
}: {
	currentTimeInSeconds: number;
	durationInSeconds: number;
	parentIsPremounting: boolean;
	parentIsPostmounting: boolean;
}) => {
	return {
		// A future entry is allowed to initialize and queue media, but it must not
		// hold the global buffer state while it is outside the current timeline.
		isPremounting:
			parentIsPremounting ||
			(!parentIsPostmounting && currentTimeInSeconds < 0),
		// Once an entry has ended, it is no longer required for the current frame
		// and must not keep playback blocked. A postmounted parent also wins.
		isPostmounting:
			parentIsPostmounting ||
			(!parentIsPremounting && currentTimeInSeconds >= durationInSeconds),
	};
};

export const shouldSeekAudioSchedulerEntry = ({
	currentFrame,
	previousFrame,
}: {
	currentFrame: number;
	previousFrame: number | null;
}) => {
	if (previousFrame === null || currentFrame === previousFrame) {
		return false;
	}

	// The scheduler is mounted for the whole segment. Seeking every timeline
	// frame is what gives each entry's iterator a chance to follow the timeline
	// and schedule audio ahead, including during ordinary playback.
	return true;
};

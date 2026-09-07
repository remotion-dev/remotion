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

// Keep enough entries mounted for MediaPlayer to schedule audio before it is
// audible, while avoiding one MediaPlayer for every cut in a long schedule.
// The audio iterator's priority queue starts work within a two-second horizon,
// so four seconds gives it room to initialize the next entry.
export const AUDIO_SCHEDULER_LOOKAHEAD_SECONDS = 4;
export const AUDIO_SCHEDULER_RETAIN_BEHIND_SECONDS = 2;

export const isAudioSchedulerEntryInWindow = ({
	entryStartTimeInSeconds,
	entryDurationInSeconds,
	currentTimeInSeconds,
	lookaheadSeconds = AUDIO_SCHEDULER_LOOKAHEAD_SECONDS,
	retainBehindSeconds = AUDIO_SCHEDULER_RETAIN_BEHIND_SECONDS,
}: {
	entryStartTimeInSeconds: number;
	entryDurationInSeconds: number;
	currentTimeInSeconds: number;
	lookaheadSeconds?: number;
	retainBehindSeconds?: number;
}) => {
	const windowStart = currentTimeInSeconds - retainBehindSeconds;
	const windowEnd = currentTimeInSeconds + lookaheadSeconds;
	const entryEndTimeInSeconds =
		entryStartTimeInSeconds + entryDurationInSeconds;

	return (
		entryStartTimeInSeconds < windowEnd && entryEndTimeInSeconds > windowStart
	);
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

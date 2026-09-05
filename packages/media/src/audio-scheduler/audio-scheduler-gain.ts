import type {NormalizedAudioScheduleEntry} from './audio-scheduler-types';

const clamp = (value: number, min: number, max: number) =>
	Math.min(max, Math.max(min, value));

export const getAudioScheduleEntryVolume = ({
	entry,
	timeInSeconds,
}: {
	entry: Pick<
		NormalizedAudioScheduleEntry,
		| 'durationInSeconds'
		| 'volume'
		| 'fadeInDurationInSeconds'
		| 'fadeOutDurationInSeconds'
	>;
	timeInSeconds: number;
}): number => {
	if (timeInSeconds < 0 || timeInSeconds >= entry.durationInSeconds) {
		return 0;
	}

	const {volume: entryVolume} = entry;
	let volume = entryVolume;

	if (entry.fadeInDurationInSeconds > 0) {
		volume *= clamp(timeInSeconds / entry.fadeInDurationInSeconds, 0, 1);
	}

	if (entry.fadeOutDurationInSeconds > 0) {
		volume *= clamp(
			(entry.durationInSeconds - timeInSeconds) /
				entry.fadeOutDurationInSeconds,
			0,
			1,
		);
	}

	return volume;
};

export const setAudioScheduleEntryVolume = ({
	gainNode,
	volume,
	audioContextCurrentTime,
}: {
	gainNode: GainNode;
	volume: number;
	audioContextCurrentTime: number;
}) => {
	// Updating the outer entry gain is intentionally independent from the
	// MediaPlayer gain. The MediaPlayer must stay audible internally so that a
	// muted entry still decodes, schedules audio, and participates in buffering.
	gainNode.gain.cancelScheduledValues(audioContextCurrentTime);
	gainNode.gain.setValueAtTime(volume, audioContextCurrentTime);
};

export const scheduleAudioScheduleEntryGain = ({
	gainNode,
	entry,
	schedulerStartTimeInSeconds,
	audioSyncAnchor,
	audioContextCurrentTime,
}: {
	gainNode: GainNode;
	entry: Pick<
		NormalizedAudioScheduleEntry,
		| 'startTimeInSeconds'
		| 'durationInSeconds'
		| 'volume'
		| 'fadeInDurationInSeconds'
		| 'fadeOutDurationInSeconds'
	>;
	schedulerStartTimeInSeconds: number;
	audioSyncAnchor: {readonly value: number};
	audioContextCurrentTime: number;
}) => {
	const now = audioContextCurrentTime;
	const audioStartTime =
		audioSyncAnchor.value +
		schedulerStartTimeInSeconds +
		entry.startTimeInSeconds;
	const audioEndTime = audioStartTime + entry.durationInSeconds;
	const {gain} = gainNode;

	// Rebuild the whole envelope whenever the shared anchor changes. This is
	// scheduled on the Web Audio clock, so it does not depend on React frame
	// timing and does not reset the gain on every rendered frame.
	gain.cancelScheduledValues(now);

	if (audioEndTime <= now) {
		gain.setValueAtTime(0, now);
		return;
	}

	const audibleStartTime = Math.max(now, audioStartTime);
	const remainingDuration = audioEndTime - audibleStartTime;
	const fadeInDuration = Math.min(
		entry.fadeInDurationInSeconds,
		remainingDuration / 2,
	);
	const fadeOutDuration = Math.min(
		entry.fadeOutDurationInSeconds,
		remainingDuration / 2,
	);
	const fadeInEndTime = audibleStartTime + fadeInDuration;
	const fadeOutStartTime = audioEndTime - fadeOutDuration;

	gain.setValueAtTime(0, now);
	if (audibleStartTime > now) {
		gain.setValueAtTime(0, audibleStartTime);
	}

	if (fadeInDuration > 0) {
		gain.linearRampToValueAtTime(entry.volume, fadeInEndTime);
	} else {
		gain.setValueAtTime(entry.volume, audibleStartTime);
	}

	if (fadeOutDuration > 0) {
		if (fadeOutStartTime > fadeInEndTime) {
			gain.setValueAtTime(entry.volume, fadeOutStartTime);
		}

		gain.linearRampToValueAtTime(0, audioEndTime);
	} else {
		gain.setValueAtTime(0, audioEndTime);
	}
};

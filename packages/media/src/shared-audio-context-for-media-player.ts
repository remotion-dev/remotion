export type ScheduleAudioNodeOptions = {
	node: AudioBufferSourceNode;
	mediaTimestamp: number;
	currentMediaTime: number;
	combinedPlaybackRate: number;
	maxDuration: number | null;
};

export type SharedAudioContextForMediaPlayer = {
	audioContext: AudioContext;
	audioSyncAnchor: {value: number};
	scheduleAudioNode: (options: ScheduleAudioNodeOptions) => boolean;
};

export const createSharedAudioContextForMediaPlayer = (
	audioContext: AudioContext,
	audioSyncAnchor: {value: number},
): SharedAudioContextForMediaPlayer => {
	let lastScheduledEnd: number | null = null;

	return {
		audioContext,
		audioSyncAnchor,
		scheduleAudioNode: ({
			node,
			mediaTimestamp,
			currentMediaTime,
			combinedPlaybackRate,
			maxDuration,
		}) => {
			const delayWithoutPlaybackRate = mediaTimestamp - currentMediaTime;
			const delay = delayWithoutPlaybackRate / combinedPlaybackRate;

			let startAt: number;
			let duration: number;

			if (delay >= 0) {
				startAt = audioContext.currentTime + delay;
				duration = maxDuration ?? node.buffer?.duration ?? 0;
				node.start(startAt, 0, maxDuration ?? undefined);
			} else {
				const offset = -delayWithoutPlaybackRate;
				if (maxDuration !== null && maxDuration - offset <= 0) {
					return false;
				}

				startAt = audioContext.currentTime;
				duration =
					maxDuration !== null
						? maxDuration - offset
						: (node.buffer?.duration ?? 0) - offset;
				node.start(
					startAt,
					offset,
					maxDuration !== null ? maxDuration - offset : undefined,
				);
			}

			const mediaDuration = maxDuration ?? node.buffer?.duration ?? 0;
			console.log(
				`[audio-schedule] start=${startAt.toFixed(4)} dur=${duration.toFixed(4)} end=${(startAt + duration).toFixed(4)} mediaStart=${mediaTimestamp.toFixed(4)} mediaEnd=${(mediaTimestamp + mediaDuration).toFixed(4)}`,
			);

			if (
				lastScheduledEnd !== null &&
				Math.abs(startAt - lastScheduledEnd) > 0.001
			) {
				console.warn(
					`[audio-schedule] gap/overlap: prev end=${lastScheduledEnd.toFixed(4)} next start=${startAt.toFixed(4)} diff=${(startAt - lastScheduledEnd).toFixed(4)}`,
				);
			}

			lastScheduledEnd = startAt + duration;

			return true;
		},
	};
};

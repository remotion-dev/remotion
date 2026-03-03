import {Internals, type LogLevel} from 'remotion';

export const setGlobalTimeAnchor = ({
	audioContext,
	audioSyncAnchor,
	absoluteTimeInSeconds,
	globalPlaybackRate,
	debugAudioScheduling,
	logLevel,
}: {
	audioContext: AudioContext;
	audioSyncAnchor: {value: number};
	absoluteTimeInSeconds: number;
	globalPlaybackRate: number;
	debugAudioScheduling: boolean;
	logLevel: LogLevel;
}): void => {
	const newAnchor =
		audioContext.currentTime - absoluteTimeInSeconds / globalPlaybackRate;
	const shift = (newAnchor - audioSyncAnchor.value) * globalPlaybackRate;

	// Skip small shifts to avoid audio glitches from frame-quantized re-anchoring
	if (Math.abs(shift) < 0.1) {
		return;
	}

	if (debugAudioScheduling) {
		Internals.Log.info(
			{logLevel, tag: 'audio-scheduling'},
			'Anchor changed from %s to %s with shift %s',
			audioSyncAnchor.value,
			newAnchor,
			shift,
		);
	}

	audioSyncAnchor.value = newAnchor;
};

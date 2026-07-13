import {Internals, type LogLevel} from 'remotion';

export const ALLOWED_GLOBAL_TIME_ANCHOR_SHIFT = 0.1;

type SetGlobalTimeAnchorOptions = {
	audioContext: AudioContext;
	audioSyncAnchor: {value: number};
	absoluteTimeInSeconds: number;
	globalPlaybackRate: number;
	logLevel: LogLevel;
};

export const setGlobalTimeAnchor = ({
	audioContext,
	audioSyncAnchor,
	absoluteTimeInSeconds,
	globalPlaybackRate,
	logLevel,
}: SetGlobalTimeAnchorOptions): boolean => {
	const newAnchor =
		audioContext.currentTime - absoluteTimeInSeconds / globalPlaybackRate;
	const shift = newAnchor - audioSyncAnchor.value;
	const {outputLatency} = audioContext;
	const safeOutputLatency = outputLatency === 0 ? 0.3 : outputLatency;
	const latency = audioContext.baseLatency + safeOutputLatency;

	// Skip small shifts to avoid audio glitches from frame-quantized re-anchoring
	if (Math.abs(shift) < ALLOWED_GLOBAL_TIME_ANCHOR_SHIFT + latency) {
		return false;
	}

	Internals.Log.verbose(
		{logLevel, tag: 'audio-scheduling'},
		'Anchor changed from %s to %s with shift %s',
		audioSyncAnchor.value,
		newAnchor,
		shift,
	);

	audioSyncAnchor.value = newAnchor;
	return true;
};

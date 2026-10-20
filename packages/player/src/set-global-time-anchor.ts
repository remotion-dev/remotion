import {Internals, type LogLevel} from 'remotion';

export const setGlobalTimeAnchor = ({
	audioContext,
	audioSyncAnchor,
	absoluteTimeInSeconds,
	globalPlaybackRate,
	logLevel,
	force,
}: {
	audioContext: AudioContext;
	audioSyncAnchor: {value: number};
	absoluteTimeInSeconds: number;
	globalPlaybackRate: number;
	logLevel: LogLevel;
	force: boolean;
}): boolean => {
	const newAnchor =
		audioContext.currentTime - absoluteTimeInSeconds / globalPlaybackRate;
	const shift = newAnchor - audioSyncAnchor.value;
	const tolerance = Internals.getAudioSyncAnchorTolerance(audioContext);

	// Skip small shifts to avoid audio glitches from frame-quantized re-anchoring
	if (Math.abs(shift) < tolerance && !force) {
		return false;
	}

	// If force is true, but shift is zero, no change is needed
	if (Math.abs(shift) < Number.EPSILON) {
		return false;
	}

	Internals.Log.verbose(
		{logLevel, tag: 'audio-scheduling'},
		'Anchor ' +
			(force ? 'forcibly ' : '') +
			'changed from %s to %s with shift %s',
		audioSyncAnchor.value,
		newAnchor,
		shift,
	);

	audioSyncAnchor.value = newAnchor;
	return true;
};

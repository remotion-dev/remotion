import {Internals, type LogLevel} from 'remotion';

export const ALLOWED_GLOBAL_TIME_ANCHOR_SHIFT = 0.1;

const pendingAnchorShifts = new WeakMap<
	{value: number},
	{anchor: number; rate: number; time: number}
>();

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
	const {outputLatency} = audioContext;
	const safeOutputLatency = outputLatency === 0 ? 0.3 : outputLatency;
	const latency = audioContext.baseLatency + safeOutputLatency;
	const allowedShift = ALLOWED_GLOBAL_TIME_ANCHOR_SHIFT + latency;
	const isRunning = audioContext.state === 'running';

	if ((shift >= 0 || !isRunning) && Math.abs(shift) < allowedShift && !force) {
		pendingAnchorShifts.delete(audioSyncAnchor);
		return false;
	}

	// Ignore frame jitter and temporary stalls, but recover sustained audio-clock lag.
	if (
		shift < 0 &&
		isRunning &&
		-shift < Math.max(allowedShift, 0.3) &&
		!force
	) {
		const tolerance =
			ALLOWED_GLOBAL_TIME_ANCHOR_SHIFT /
			Math.max(1, Math.abs(globalPlaybackRate));
		if (Math.abs(shift) < tolerance) {
			pendingAnchorShifts.delete(audioSyncAnchor);
			return false;
		}

		const pending = pendingAnchorShifts.get(audioSyncAnchor);
		if (
			!pending ||
			pending.anchor !== audioSyncAnchor.value ||
			pending.rate !== globalPlaybackRate
		) {
			pendingAnchorShifts.set(audioSyncAnchor, {
				anchor: audioSyncAnchor.value,
				rate: globalPlaybackRate,
				time: audioContext.currentTime,
			});
			return false;
		}

		if (audioContext.currentTime - pending.time < 0.2) {
			return false;
		}
	}

	pendingAnchorShifts.delete(audioSyncAnchor);

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

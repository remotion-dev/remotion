import type {WaveformVolume} from './draw-peaks';

export const getVisibleWaveformVolume = ({
	displayDurationInFrames,
	displayOffsetInFrames,
	volume,
}: {
	readonly displayDurationInFrames: number;
	readonly displayOffsetInFrames: number;
	readonly volume: WaveformVolume;
}): WaveformVolume => {
	if (!Array.isArray(volume)) {
		return volume;
	}

	if (
		!Number.isFinite(displayDurationInFrames) ||
		displayDurationInFrames <= 0
	) {
		return [];
	}

	// Registered curves already cover the visible composition timeline, including
	// repeat/extend behavior and partial loops introduced by ancestor trimming.
	const start = Math.max(0, Math.floor(displayOffsetInFrames));
	const end = Math.min(
		volume.length,
		Math.ceil(displayOffsetInFrames + displayDurationInFrames),
	);
	return volume.slice(start, end);
};

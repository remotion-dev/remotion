import {TARGET_NUMBER_OF_CHANNELS} from './resample-audiodata';

// A change of volume between two frames is spread over this long, so that the
// waveform doesn't jump at the frame boundary, which is heard as a click.
export const VOLUME_RAMP_SECONDS = 0.005;

export const applyVolume = (
	array: Int16Array,
	volume: number,
	// The volume of the frame before. If it differs, the start of this frame
	// glides from it to `volume` along a half cosine.
	previousVolume: number = volume,
	sampleRate: number = 48000,
): void => {
	if (volume === 1 && previousVolume === 1) {
		return;
	}

	const numberOfFrames = array.length / TARGET_NUMBER_OF_CHANNELS;
	const rampFrames =
		previousVolume === volume
			? 0
			: Math.min(numberOfFrames, Math.round(sampleRate * VOLUME_RAMP_SECONDS));

	for (let i = 0; i < array.length; i++) {
		const frame = Math.floor(i / TARGET_NUMBER_OF_CHANNELS);
		const gain =
			frame < rampFrames
				? previousVolume +
					((volume - previousVolume) *
						(1 - Math.cos((Math.PI * frame) / rampFrames))) /
						2
				: volume;
		const newValue = array[i] * gain;

		if (newValue < -32768) {
			array[i] = -32768;
		} else if (newValue > 32767) {
			array[i] = 32767;
		} else {
			array[i] = newValue;
		}
	}
};

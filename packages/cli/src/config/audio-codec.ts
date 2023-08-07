import type {AudioCodec} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';

let _audioCodec: AudioCodec | null = null;

export const setAudioCodec = (audioCodec: AudioCodec | null) => {
	if (audioCodec === null) {
		_audioCodec = null;
		return;
	}

	if (!RenderInternals.validAudioCodecs.includes(audioCodec)) {
		throw new Error(
			`Audio codec must be one of the following: ${RenderInternals.validAudioCodecs.join(
				', '
			)}, but got ${audioCodec}`
		);
	}

	_audioCodec = audioCodec;
};

export const getAudioCodec = () => {
	return _audioCodec;
};

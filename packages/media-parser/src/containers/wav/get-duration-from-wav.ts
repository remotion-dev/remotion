import type {ParserState} from '../../state/parser-state';
import type {WavData, WavFmt} from './types';

export const getDurationFromWav = (state: ParserState) => {
	const structure = state.getWavStructure();

	const fmt = structure.boxes.find((b) => b.type === 'wav-fmt') as
		| WavFmt
		| undefined;
	if (!fmt) {
		throw new Error('Expected fmt box');
	}

	const dataBox = structure.boxes.find((b) => b.type === 'wav-data') as WavData;
	if (!dataBox) {
		throw new Error('Expected data box');
	}

	const durationInSeconds =
		dataBox.dataSize / (fmt.sampleRate * fmt.blockAlign);
	return durationInSeconds;
};

export const hasDurationFromWav = (state: ParserState) => {
	try {
		return getDurationFromWav(state);
	} catch {
		return false;
	}
};

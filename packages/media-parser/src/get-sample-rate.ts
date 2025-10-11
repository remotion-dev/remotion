import type {ParserState} from './state/parser-state';

export const getSampleRate = (state: ParserState) => {
	return (
		state.callbacks.tracks.getTracks().find((track) => {
			return track.type === 'audio';
		})?.sampleRate ?? null
	);
};

export const hasSampleRate = (state: ParserState) => {
	return state.callbacks.tracks.hasAllTracks();
};

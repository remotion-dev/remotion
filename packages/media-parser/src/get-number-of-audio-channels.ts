import type {ParserState} from './state/parser-state';

export const getNumberOfAudioChannels = (state: ParserState) => {
	return (
		state.callbacks.tracks.getTracks().find((track) => {
			return track.type === 'audio';
		})?.numberOfChannels ?? null
	);
};

export const hasNumberOfAudioChannels = (state: ParserState) => {
	return state.callbacks.tracks.hasAllTracks();
};

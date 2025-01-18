import type {ParserState} from '../../state/parser-state';
import type {AllTracks} from '../riff/get-tracks-from-avi';

export const getTracksFromMp3OrWavOrAac = (
	parserState: ParserState,
): AllTracks => {
	const tracks = parserState.callbacks.tracks.getTracks();
	if (tracks.length === 0) {
		throw new Error('No tracks found');
	}

	return {
		audioTracks: tracks.filter((t) => t.type === 'audio'),
		otherTracks: [],
		videoTracks: [],
	};
};

export const hasAllTracksFromMp3OrWavOrAac = (
	parserState: ParserState,
): boolean => {
	try {
		getTracksFromMp3OrWavOrAac(parserState);
		return true;
	} catch {
		return false;
	}
};

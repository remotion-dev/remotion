import type {ParserState} from '../../state/parser-state';
import {truthy} from '../../truthy';
import type {AllTracks} from '../riff/get-tracks-from-avi';
import {findProgramMapTableOrThrow} from './traversal';

export const getTracksFromTransportStream = (
	parserState: ParserState,
): AllTracks => {
	const structure = parserState.getTsStructure();
	const programMapTable = findProgramMapTableOrThrow(structure);
	const parserTracks = parserState.callbacks.tracks.getTracks();

	const mapped = programMapTable.streams
		// only search for supported streams
		.filter((stream) => stream.streamType === 27 || stream.streamType === 15)
		.map((stream) => {
			return parserTracks.find((track) => track.trackId === stream.pid);
		})
		.filter(truthy);
	if (
		mapped.length !==
		programMapTable.streams.filter(
			(s) => s.streamType === 27 || s.streamType === 15,
		).length
	) {
		throw new Error('Not all tracks found');
	}

	return {
		videoTracks: mapped.filter((track) => track.type === 'video'),
		audioTracks: mapped.filter((track) => track.type === 'audio'),
		otherTracks: [],
	};
};

export const hasAllTracksFromTransportStream = (parserState: ParserState) => {
	try {
		getTracksFromTransportStream(parserState);
		return true;
	} catch {
		return false;
	}
};

import type {ParserState} from '../../state/parser-state';
import {truthy} from '../../truthy';
import type {AllTracks} from '../riff/get-tracks-from-avi';
import type {TransportStreamEntry} from './parse-pmt';
import {findProgramMapTableOrThrow} from './traversal';

export const filterStreamsBySupportedTypes = (
	streams: TransportStreamEntry[],
) => {
	return streams.filter(
		(stream) => stream.streamType === 27 || stream.streamType === 15,
	);
};

export const getTracksFromTransportStream = (
	parserState: ParserState,
): AllTracks => {
	const structure = parserState.getTsStructure();
	const programMapTable = findProgramMapTableOrThrow(structure);
	const parserTracks = parserState.callbacks.tracks.getTracks();

	const mapped = filterStreamsBySupportedTypes(programMapTable.streams)
		.map((stream) => {
			return parserTracks.find((track) => track.trackId === stream.pid);
		})
		.filter(truthy);
	if (
		mapped.length !==
		filterStreamsBySupportedTypes(programMapTable.streams).length
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

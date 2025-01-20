import type {ParserState} from '../../state/parser-state';

export const getDurationFromFlac = (parserState: ParserState) => {
	const structure = parserState.structure.getStructure();
	if (structure.type !== 'flac') {
		throw new Error('Not a FLAC file');
	}

	const streaminfo = structure.boxes.find((b) => b.type === 'flac-streaminfo');
	if (!streaminfo) {
		throw new Error('Streaminfo not found');
	}

	return streaminfo.totalSamples / streaminfo.sampleRate;
};

import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';

export const parseRiffHeader = (state: ParserState): ParseResult => {
	const riff = state.iterator.getByteString(4, false);
	if (riff !== 'RIFF') {
		throw new Error('Not a RIFF file');
	}

	const structure = state.getRiffStructure();

	const size = state.iterator.getUint32Le();
	const fileType = state.iterator.getByteString(4, false);
	if (fileType !== 'WAVE' && fileType !== 'AVI') {
		throw new Error(`File type ${fileType} not supported`);
	}

	structure.boxes.push({type: 'riff-header', fileSize: size, fileType});

	return null;
};

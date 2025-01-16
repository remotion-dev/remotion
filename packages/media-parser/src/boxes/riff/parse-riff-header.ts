import type {BufferIterator} from '../../buffer-iterator';
import type {Options, ParseMediaFields} from '../../options';
import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {parseRiff} from './parse-riff';

export const parseRiffHeader = ({
	iterator,
	state,
	fields,
}: {
	iterator: BufferIterator;
	state: ParserState;
	fields: Options<ParseMediaFields>;
}): ParseResult => {
	const continueParsing = () => {
		return parseRiff({
			fields,
			iterator,
			state,
		});
	};

	const riff = iterator.getByteString(4, false);
	if (riff !== 'RIFF') {
		throw new Error('Not a RIFF file');
	}

	const structure = state.structure.getStructure();
	if (structure.type !== 'riff') {
		throw new Error('Structure is not a RIFF structure');
	}

	const size = iterator.getUint32Le();
	const fileType = iterator.getByteString(4, false);
	if (fileType !== 'WAVE' && fileType !== 'AVI') {
		throw new Error(`File type ${fileType} not supported`);
	}

	structure.boxes.push({type: 'riff-header', fileSize: size, fileType});

	return {
		status: 'incomplete',
		continueParsing,
		skipTo: null,
	};
};

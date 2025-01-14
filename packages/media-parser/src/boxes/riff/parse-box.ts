import type {BufferIterator} from '../../buffer-iterator';
import {hasAllInfo} from '../../has-all-info';
import type {Options, ParseMediaFields} from '../../options';
import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {parseRiffBody} from './parse-riff-body';

export const parseRiff = ({
	iterator,
	state,
	fields,
}: {
	iterator: BufferIterator;
	state: ParserState;
	fields: Options<ParseMediaFields>;
}): Promise<ParseResult> => {
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

	if (hasAllInfo({fields, state})) {
		return Promise.resolve({
			status: 'done',
			segments: structure,
		});
	}

	return parseRiffBody({
		iterator,
		maxOffset: Infinity,
		state,
		structure,
		fields,
	});
};

import type {BufferIterator} from '../../buffer-iterator';
import {Log} from '../../log';
import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {parseData} from './parse-data';
import {parseFmt} from './parse-fmt';
import {parseHeader} from './parse-header';
import {parseId3} from './parse-id3';
import {parseList} from './parse-list';

export const parseWav = ({
	iterator,
	state,
}: {
	iterator: BufferIterator;
	state: ParserState;
}): Promise<ParseResult> => {
	const type = iterator.getByteString(4, false);
	Log.trace(state.logLevel, `Processing box type ${type}`);
	if (type === 'RIFF') {
		return parseHeader({iterator, state});
	}

	if (type === 'fmt') {
		return parseFmt({iterator, state});
	}

	if (type === 'data') {
		return parseData({iterator, state});
	}

	if (type === 'LIST') {
		return parseList({iterator, state});
	}

	if (type === 'id3') {
		return parseId3({iterator, state});
	}

	throw new Error(`Unknown WAV box type ${type}`);
};

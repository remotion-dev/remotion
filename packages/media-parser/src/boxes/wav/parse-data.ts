import type {BufferIterator} from '../../buffer-iterator';
import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import type {WavData, WavStructure} from './types';

export const parseData = ({
	iterator,
	state,
}: {
	iterator: BufferIterator;
	state: ParserState;
}): Promise<ParseResult> => {
	const ckSize = iterator.getUint32Le(); // chunkSize
	const box: WavData = {
		type: 'wav-data',
		dataSize: ckSize,
	};

	// TODO: skip data if can skip

	(state.structure.getStructure() as WavStructure).boxes.push(box);
	state.callbacks.tracks.setIsDone();

	iterator.discard(ckSize);

	return Promise.resolve({skipTo: null});
};

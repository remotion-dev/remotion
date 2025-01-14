import type {BufferIterator} from '../../buffer-iterator';
import type {IsoBaseMediaBox} from '../../parse-result';
import type {BoxAndNext} from '../../parse-video';
import type {ParserState} from '../../state/parser-state';
import {parseMdat} from './mdat/mdat';

export const parseMdatPartially = async ({
	iterator,
	boxSize,
	fileOffset,
	parsedBoxes,
	state,
	signal,
}: {
	iterator: BufferIterator;
	boxSize: number;
	fileOffset: number;
	parsedBoxes: IsoBaseMediaBox[];
	state: ParserState;
	signal: AbortSignal | null;
}): Promise<BoxAndNext> => {
	const box = await parseMdat({
		data: iterator,
		size: boxSize,
		fileOffset,
		existingBoxes: parsedBoxes,
		state,
		signal,
		maySkipSampleProcessing: state.supportsContentRange,
	});

	if (
		(box.status === 'samples-processed' || box.status === 'samples-buffered') &&
		box.fileOffset + boxSize === iterator.counter.getOffset()
	) {
		return {
			type: 'complete',
			box,
			size: boxSize,
			skipTo: null,
		};
	}

	return {
		type: 'partial-mdat-box',
		boxSize,
		fileOffset,
	};
};

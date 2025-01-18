import type {BufferIterator} from '../../buffer-iterator';
import {maySkipVideoData} from '../../may-skip-video-data/may-skip-video-data';
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

	(state.structure.getStructure() as WavStructure).boxes.push(box);
	state.callbacks.tracks.setIsDone();

	state.videoSection.setVideoSection({
		size: ckSize,
		start: iterator.counter.getOffset(),
	});

	if (maySkipVideoData({state})) {
		return Promise.resolve({
			skipTo: iterator.counter.getOffset() + ckSize,
		});
	}

	return Promise.resolve({skipTo: null});
};

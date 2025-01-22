import type {ParseResult} from '../../parse-result';
import {makeSkip} from '../../skip';
import {maySkipVideoData} from '../../state/may-skip-video-data';
import type {ParserState} from '../../state/parser-state';
import type {WavData} from './types';

export const parseData = ({
	state,
}: {
	state: ParserState;
}): Promise<ParseResult> => {
	const {iterator} = state;
	const ckSize = iterator.getUint32Le(); // chunkSize
	const box: WavData = {
		type: 'wav-data',
		dataSize: ckSize,
	};

	state.getWavStructure().boxes.push(box);
	state.callbacks.tracks.setIsDone(state.logLevel);

	state.videoSection.setVideoSection({
		size: ckSize,
		start: iterator.counter.getOffset(),
	});

	if (maySkipVideoData({state})) {
		// Skipping only in query mode
		return Promise.resolve(makeSkip(iterator.counter.getOffset() + ckSize));
	}

	return Promise.resolve(null);
};

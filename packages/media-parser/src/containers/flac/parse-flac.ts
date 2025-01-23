import type {BufferIterator} from '../../buffer-iterator';
import type {ParseResult} from '../../parse-result';
import {makeSkip} from '../../skip';
import {maySkipVideoData} from '../../state/may-skip-video-data';
import type {ParserState} from '../../state/parser-state';
import {parseFlacFrame} from './parse-flac-frame';
import {parseFlacHeader} from './parse-header';
import {parseVorbisComment} from './parse-metadata';
import {parseStreamInfo} from './parse-streaminfo';
import {parseFlacUnkownBlock} from './parse-unknown-block';

const flacTypes = {
	streaminfo: 0,
	vorbisComment: 4,
};

export const parseFlac = ({
	iterator,
	state,
}: {
	iterator: BufferIterator;
	state: ParserState;
}): Promise<ParseResult> => {
	const videoSectionState = state.videoSection.isInVideoSectionState(iterator);
	if (videoSectionState === 'in-section') {
		if (maySkipVideoData({state})) {
			return Promise.resolve(makeSkip(state.contentLength));
		}

		return parseFlacFrame({state, iterator});
	}

	const bytes = iterator.getByteString(4, true);

	if (bytes === 'fLaC') {
		return parseFlacHeader({state, iterator});
	}

	iterator.counter.decrement(4);

	// https://www.rfc-editor.org/rfc/rfc9639.html#name-streaminfo
	// section 8.1
	iterator.startReadingBits();
	const isLastMetadata = iterator.getBits(1);
	const metaBlockType = iterator.getBits(7);
	iterator.stopReadingBits();
	const size = iterator.getUint24();
	if (isLastMetadata) {
		state.videoSection.setVideoSection({
			start: iterator.counter.getOffset() + size,
			size: state.contentLength - iterator.counter.getOffset() - size,
		});
	}

	if (metaBlockType === flacTypes.streaminfo) {
		return parseStreamInfo({iterator, state});
	}

	if (metaBlockType === flacTypes.vorbisComment) {
		return parseVorbisComment({iterator, state, size});
	}

	return parseFlacUnkownBlock({iterator, state, size});
};

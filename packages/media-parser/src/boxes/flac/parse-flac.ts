import type {BufferIterator} from '../../buffer-iterator';
import {maySkipVideoData} from '../../may-skip-video-data/may-skip-video-data';
import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {parseFlacFrame} from './parse-flac-frame';
import {parseFlacHeader} from './parse-header';
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
			if (!state.contentLength) {
				throw new Error('Need content-length for FLAC to parse');
			}

			return Promise.resolve({skipTo: state.contentLength});
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
		if (!state.contentLength) {
			throw new Error('Need content-length for FLAC to parse');
		}

		state.videoSection.setVideoSection({
			start: iterator.counter.getOffset() + size,
			size: state.contentLength - iterator.counter.getOffset() - size,
		});
	}

	if (metaBlockType === flacTypes.streaminfo) {
		return parseStreamInfo({iterator, state});
	}

	return parseFlacUnkownBlock({iterator, state, size});
};

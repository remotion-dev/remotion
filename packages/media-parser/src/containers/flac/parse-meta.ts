import type {BufferIterator} from '../../iterator/buffer-iterator';
import type {ParserState} from '../../state/parser-state';
import {parseVorbisComment} from './parse-metadata';
import {parseStreamInfo} from './parse-streaminfo';
import {parseFlacUnkownBlock} from './parse-unknown-block';

const flacTypes = {
	streaminfo: 0,
	vorbisComment: 4,
};

export const parseMetaBlock = ({
	iterator,
	state,
}: {
	iterator: BufferIterator;
	state: ParserState;
}) => {
	iterator.startReadingBits();
	const isLastMetadata = iterator.getBits(1);
	const metaBlockType = iterator.getBits(7);
	iterator.stopReadingBits();
	const size = iterator.getUint24();
	if (isLastMetadata) {
		state.mediaSection.addMediaSection({
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

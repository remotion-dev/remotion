import type {BufferIterator} from '../../iterator/buffer-iterator';
import type {ParseResult} from '../../parse-result';
import {makeSkip} from '../../skip';
import {maySkipVideoData} from '../../state/may-skip-video-data';
import type {ParserState} from '../../state/parser-state';
import {parseFlacFrame} from './parse-flac-frame';
import {parseFlacHeader} from './parse-header';
import {parseMetaBlock} from './parse-meta';

export const parseFlac = ({
	iterator,
	state,
}: {
	iterator: BufferIterator;
	state: ParserState;
}): Promise<ParseResult> => {
	const mediaSectionState =
		state.mediaSection.isCurrentByteInMediaSection(iterator);
	if (mediaSectionState === 'in-section') {
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

	return parseMetaBlock({
		iterator,
		state,
	});
};

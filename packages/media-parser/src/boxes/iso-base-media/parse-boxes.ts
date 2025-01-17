import type {BufferIterator} from '../../buffer-iterator';
import type {IsoBaseMediaStructure, ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {parseMdatSection} from './mdat/mdat';
import {processBox} from './process-box';

export const parseIsoBaseMedia = async ({
	iterator,
	state,
}: {
	iterator: BufferIterator;
	state: ParserState;
}): Promise<ParseResult> => {
	const continueParsing = () => {
		return parseIsoBaseMedia({
			iterator,
			state,
		});
	};

	const videoSectionState = state.videoSection.isInVideoSectionState(iterator);

	if (videoSectionState === 'in-section') {
		const skipTo = await parseMdatSection({
			iterator,
			state,
		});
		return {
			continueParsing,
			skipTo,
			status: 'incomplete',
		};
	}

	const result = await processBox({
		iterator,
		state,
	});
	if (result.box) {
		(state.structure.getStructure() as IsoBaseMediaStructure).boxes.push(
			result.box,
		);
	}

	if (
		iterator.counter.getOffset() === state.contentLength &&
		state.iso.getShouldReturnToVideoSectionAfterEnd()
	) {
		state.iso.setShouldReturnToVideoSectionAfterEnd(false);

		return {
			status: 'incomplete',
			continueParsing,
			skipTo: state.videoSection.getVideoSection().start,
		};
	}

	if (result.skipTo !== null) {
		return {
			status: 'incomplete',
			continueParsing,
			skipTo: result.skipTo,
		};
	}

	if (iterator.bytesRemaining() < 0) {
		return {
			status: 'incomplete',
			continueParsing,
			skipTo: null,
		};
	}

	iterator.removeBytesRead();

	return {
		status: 'incomplete',
		continueParsing,
		skipTo: null,
	};
};

import type {IsoBaseMediaStructure, ParseResult} from '../../parse-result';
import {makeSkip} from '../../skip';
import type {ParserState} from '../../state/parser-state';
import {parseMdatSection} from './mdat/mdat';
import {processBox} from './process-box';

export const parseIsoBaseMedia = async (
	state: ParserState,
): Promise<ParseResult> => {
	const videoSectionState = state.videoSection.isInVideoSectionState(
		state.iterator,
	);

	if (videoSectionState === 'in-section') {
		const skipTo = await parseMdatSection(state);

		return skipTo;
	}

	const result = await processBox(state);
	if (result.box) {
		(state.structure.getStructure() as IsoBaseMediaStructure).boxes.push(
			result.box,
		);
	}

	const {iterator} = state;

	if (
		iterator.counter.getOffset() === state.contentLength &&
		state.iso.getShouldReturnToVideoSectionAfterEnd()
	) {
		state.iso.setShouldReturnToVideoSectionAfterEnd(false);

		// TODO: Be smart about skipTo
		return makeSkip(state.videoSection.getVideoSection().start);
	}

	return null;
};

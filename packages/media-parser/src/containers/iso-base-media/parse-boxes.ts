import type {ParseResult} from '../../parse-result';
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
	if (result) {
		state.getIsoStructure().boxes.push(result);
	}

	return null;
};

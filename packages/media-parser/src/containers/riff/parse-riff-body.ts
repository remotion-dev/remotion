import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {expectRiffBox} from './expect-riff-box';
import {parseVideoSection} from './parse-video-section';
import type {RiffStructure} from './riff-box';

export const parseRiffBody = async (
	state: ParserState,
): Promise<ParseResult> => {
	if (
		state.videoSection.isInVideoSectionState(state.iterator) === 'in-section'
	) {
		const videoSec = await parseVideoSection(state);
		return {
			skipTo: videoSec.skipTo,
		};
	}

	const result = await expectRiffBox(state);
	if (result.box !== null) {
		const structure = state.structure.getStructure() as RiffStructure;
		structure.boxes.push(result.box);
	}

	return {
		skipTo: result.skipTo,
	};
};

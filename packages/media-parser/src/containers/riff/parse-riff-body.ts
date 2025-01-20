import type {ParseResult} from '../../parse-result';
import {maySkipVideoData} from '../../state/may-skip-video-data';
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
		if (
			maySkipVideoData({
				state,
			}) &&
			state.riff.getAvcProfile()
		) {
			const videoSection = state.videoSection.getVideoSection();
			return Promise.resolve({
				skipTo: videoSection.start + videoSection.size,
			});
		}

		await parseVideoSection(state);
		return {
			skipTo: null,
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

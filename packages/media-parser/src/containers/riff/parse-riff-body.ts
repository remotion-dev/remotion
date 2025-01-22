import type {ParseResult} from '../../parse-result';
import {makeSkip} from '../../skip';
import {maySkipVideoData} from '../../state/may-skip-video-data';
import type {ParserState} from '../../state/parser-state';
import {expectRiffBox} from './expect-riff-box';
import {parseVideoSection} from './parse-video-section';

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

			// only skipping forward in query mode
			return Promise.resolve(makeSkip(videoSection.start + videoSection.size));
		}

		await parseVideoSection(state);
		return null;
	}

	const box = await expectRiffBox(state);
	if (box !== null) {
		const structure = state.getRiffStructure();
		structure.boxes.push(box);
	}

	return null;
};

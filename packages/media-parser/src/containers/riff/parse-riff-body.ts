import type {ParseResult} from '../../parse-result';
import {makeSkip} from '../../skip';
import {maySkipVideoData} from '../../state/may-skip-video-data';
import type {ParserState} from '../../state/parser-state';
import {getCurrentMediaSection} from '../../state/video-section';
import {convertQueuedSampleToMediaParserSample} from './convert-queued-sample-to-mediaparser-sample';
import {expectRiffBox, postProcessRiffBox} from './expect-riff-box';
import {parseMediaSection} from './parse-video-section';

export const parseRiffBody = async (
	state: ParserState,
): Promise<ParseResult> => {
	const releasedFrame = state.riff.queuedBFrames.getReleasedFrame();
	if (releasedFrame) {
		await state.callbacks.onVideoSample(
			releasedFrame.trackId,
			convertQueuedSampleToMediaParserSample(releasedFrame, state),
		);
		return null;
	}

	if (
		state.mediaSection.isCurrentByteInMediaSection(state.iterator) ===
		'in-section'
	) {
		if (
			maySkipVideoData({
				state,
			}) &&
			state.riff.getAvcProfile()
		) {
			const mediaSection = getCurrentMediaSection({
				offset: state.iterator.counter.getOffset(),
				mediaSections: state.mediaSection.getMediaSections(),
			});
			if (!mediaSection) {
				throw new Error('No video section defined');
			}

			// only skipping forward in query mode
			return Promise.resolve(makeSkip(mediaSection.start + mediaSection.size));
		}

		await parseMediaSection(state);
		return null;
	}

	const box = await expectRiffBox({
		iterator: state.iterator,
		stateIfExpectingSideEffects: state,
	});
	if (box !== null) {
		await postProcessRiffBox(state, box);
		const structure = state.structure.getRiffStructure();
		structure.boxes.push(box);
	}

	return null;
};

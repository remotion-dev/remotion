import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {getWorkOnSeekRequestOptions} from '../../work-on-seek-request';
import {parseMdatSection} from './mdat/mdat';
import {processBox} from './process-box';

export const parseIsoBaseMedia = async (
	state: ParserState,
): Promise<ParseResult> => {
	const videoSectionState = state.videoSection.isCurrentByteInVideoSection(
		state.iterator,
	);

	if (videoSectionState === 'in-section') {
		const skipTo = await parseMdatSection(state);

		return skipTo;
	}

	const result = await processBox({
		iterator: state.iterator,
		logLevel: state.logLevel,
		onlyIfMoovAtomExpected: {
			tracks: state.callbacks.tracks,
			isoState: state.iso,
			workOnSeekRequestOptions: getWorkOnSeekRequestOptions(state),
			onAudioTrack: state.onAudioTrack,
			onVideoTrack: state.onVideoTrack,
			registerAudioSampleCallback: state.callbacks.registerAudioSampleCallback,
			registerVideoSampleCallback: state.callbacks.registerVideoSampleCallback,
		},
		onlyIfMdatAtomExpected: {
			videoSectionState: state.videoSection,
		},
	});
	if (result) {
		state.structure.getIsoStructure().boxes.push(result);
	}

	return null;
};

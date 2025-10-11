import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {parseMdatSection} from './mdat/mdat';
import {processBox} from './process-box';

export const parseIsoBaseMedia = async (
	state: ParserState,
): Promise<ParseResult> => {
	const mediaSectionState = state.mediaSection.isCurrentByteInMediaSection(
		state.iterator,
	);

	if (mediaSectionState === 'in-section') {
		const skipTo = await parseMdatSection(state);
		return skipTo;
	}

	const result = await processBox({
		iterator: state.iterator,
		logLevel: state.logLevel,
		onlyIfMoovAtomExpected: {
			tracks: state.callbacks.tracks,
			isoState: state.iso,
			movieTimeScaleState: state.iso.movieTimeScale,
			onAudioTrack: state.onAudioTrack,
			onVideoTrack: state.onVideoTrack,
			registerAudioSampleCallback: state.callbacks.registerAudioSampleCallback,
			registerVideoSampleCallback: state.callbacks.registerVideoSampleCallback,
		},
		onlyIfMdatAtomExpected: {
			mediaSectionState: state.mediaSection,
		},
		contentLength: state.contentLength,
	});
	if (result.type === 'fetch-more-data') {
		return result.bytesNeeded;
	}

	if (result.type === 'box') {
		state.structure.getIsoStructure().boxes.push(result.box);
	}

	return null;
};

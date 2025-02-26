import {registerAudioTrack, registerVideoTrack} from '../../register-track';
import type {M3uState} from '../../state/m3u-state';
import type {ParserState} from '../../state/parser-state';
import {fetchM3u8Stream} from './fetch-m3u8-stream';
import {getM3uStreams, isIndependentSegments} from './get-streams';
import {iteratorOverTsFiles} from './return-packets';
import type {SelectM3uStreamFn} from './select-stream';
import {selectStream} from './select-stream';
import type {M3uStructure} from './types';

export const afterManifestFetch = async ({
	structure,
	m3uState,
	src,
	selectM3uStreamFn,
}: {
	structure: M3uStructure;
	m3uState: M3uState;
	src: string | null;
	selectM3uStreamFn: SelectM3uStreamFn;
}) => {
	const independentSegments = isIndependentSegments(structure);
	if (!independentSegments) {
		if (!src) {
			throw new Error('No src');
		}

		m3uState.setSelectedStream({
			type: 'initial-url',
			url: src,
		});

		return m3uState.setReadyToIterateOverM3u();
	}

	const streams = getM3uStreams(structure, src);
	if (streams === null) {
		throw new Error('No streams found');
	}

	const selectedStream = await selectStream({streams, fn: selectM3uStreamFn});
	m3uState.setSelectedStream({type: 'selected-stream', stream: selectedStream});

	if (!selectedStream.resolution) {
		throw new Error('Stream does not have a resolution');
	}

	const boxes = await fetchM3u8Stream(selectedStream);
	structure.boxes.push({type: 'm3u-playlist', boxes});
	m3uState.setReadyToIterateOverM3u();
};

export const runOverM3u = async ({
	state,
	structure,
}: {
	state: ParserState;
	structure: M3uStructure;
}) => {
	const existingRun = state.m3u.getM3uStreamRun();

	if (existingRun) {
		const run = await existingRun.continue();
		state.m3u.setM3uStreamRun(run);
		if (!run) {
			state.m3u.setAllChunksProcessed();
		}

		return;
	}

	return new Promise<void>((resolve, reject) => {
		const selectedStream = state.m3u.getSelectedStream();
		if (!selectedStream) {
			throw new Error('No stream selected');
		}

		const run = iteratorOverTsFiles({
			playlistUrl:
				selectedStream.type === 'initial-url'
					? selectedStream.url
					: selectedStream.stream.url,
			structure,
			onInitialProgress: (newRun) => {
				state.m3u.setM3uStreamRun(newRun);
				resolve();
			},
			logLevel: state.logLevel,
			onDoneWithTracks() {
				state.callbacks.tracks.setIsDone(state.logLevel);
			},
			onAudioTrack: (track) => {
				return registerAudioTrack({
					container: 'm3u8',
					state,
					track,
				});
			},
			onVideoTrack: (track) => {
				return registerVideoTrack({
					container: 'm3u8',
					state,
					track,
				});
			},
			m3uState: state.m3u,
			parentController: state.controller,
		});

		run.catch((err) => {
			reject(err);
		});
	});
};

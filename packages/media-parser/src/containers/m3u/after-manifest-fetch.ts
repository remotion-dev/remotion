import {registerAudioTrack, registerVideoTrack} from '../../register-track';
import type {M3uState} from '../../state/m3u-state';
import type {ParserState} from '../../state/parser-state';
import {fetchM3u8Stream} from './fetch-m3u8-stream';
import {getM3uStreams} from './get-streams';
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
	const streams = getM3uStreams(structure, src);
	if (streams === null) {
		throw new Error('No streams found');
	}

	const selectedStream = await selectStream({streams, fn: selectM3uStreamFn});
	m3uState.setSelectedStream(selectedStream);

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
	const selectedStream = state.m3u.getSelectedStream();
	if (!selectedStream) {
		throw new Error('No stream selected');
	}

	await iteratorOverTsFiles({
		playlistUrl: selectedStream.url,
		structure,
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
	});
};

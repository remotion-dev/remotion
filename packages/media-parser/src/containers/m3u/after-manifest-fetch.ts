import {registerTrack} from '../../register-track';
import type {M3uState} from '../../state/m3u-state';
import type {ParserState} from '../../state/parser-state';
import {fetchM3u8Stream} from './fetch-m3u8-stream';
import {getStreams} from './get-streams';
import {iteratorOverTsFiles} from './return-packets';
import {selectStream} from './select-stream';
import type {M3uStructure} from './types';

export const afterManifestFetch = async ({
	structure,
	m3uState,
	state,
	src,
}: {
	structure: M3uStructure;
	m3uState: M3uState;
	state: ParserState;
	src: string | null;
}) => {
	const streams = getStreams(structure, src);

	const selectedStream = await selectStream(streams);
	m3uState.setSelectedStream(selectedStream);

	if (!selectedStream.box.resolution) {
		throw new Error('Stream does not have a resolution');
	}

	const boxes = await fetchM3u8Stream(selectedStream);
	structure.boxes.push({type: 'm3u-playlist', boxes});
	await iteratorOverTsFiles({
		playlistUrl: selectedStream.url,
		structure,
		logLevel: state.logLevel,
		onDoneWithTracks() {
			state.callbacks.tracks.setIsDone(state.logLevel);
		},
		onAudioTrack: async (track) => {
			await registerTrack({
				container: 'm3u8',
				state,
				track,
			});
		},
		onVideoTrack: async (track) => {
			await registerTrack({
				container: 'm3u8',
				state,
				track,
			});
		},
		m3uState,
	});
};

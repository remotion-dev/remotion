import type {LogLevel} from '../../log';
import {Log} from '../../log';
import type {M3u8SeekingHints} from '../../seeking-hints';
import type {M3uState} from '../../state/m3u-state';
import type {SeekResolution} from '../../work-on-seek-request';

export const getSeekingByteForM3u8 = ({
	time,
	seekingHints,
	currentPosition,
	m3uState,
	logLevel,
}: {
	time: number;
	seekingHints: M3u8SeekingHints;
	currentPosition: number;
	m3uState: M3uState;
	logLevel: LogLevel;
}): SeekResolution => {
	const selectedPlaylists = m3uState.getSelectedPlaylists();
	for (const playlistUrl of selectedPlaylists) {
		const streamRun = m3uState.getM3uStreamRun(playlistUrl);
		if (streamRun) {
			streamRun.abort();
		}

		Log.trace(logLevel, 'Clearing M3U stream run for', playlistUrl);
		m3uState.setM3uStreamRun(playlistUrl, null);
	}

	m3uState.clearAllChunksProcessed();

	return {
		type: 'do-seek',
		byte: currentPosition,
	};
};

import type {MediaParserLogLevel} from '../../log';
import {Log} from '../../log';
import type {M3uState} from '../../state/m3u-state';
import type {SeekResolution} from '../../work-on-seek-request';

export const clearM3uStateInPrepareForSeek = ({
	m3uState,
	logLevel,
}: {
	m3uState: M3uState;
	logLevel: MediaParserLogLevel;
}) => {
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
	m3uState.sampleSorter.clearSamples();
};

export const getSeekingByteForM3u8 = ({
	time,
	currentPosition,
	m3uState,
	logLevel,
}: {
	time: number;
	currentPosition: number;
	m3uState: M3uState;
	logLevel: MediaParserLogLevel;
}): SeekResolution => {
	clearM3uStateInPrepareForSeek({m3uState, logLevel});
	const selectedPlaylists = m3uState.getSelectedPlaylists();
	for (const playlistUrl of selectedPlaylists) {
		m3uState.setSeekToSecondsToProcess(playlistUrl, {
			targetTime: time,
		});
	}

	return {
		type: 'do-seek',
		byte: currentPosition,
		// TODO: This will be imperfect when seeking in playMedia()
		timeInSeconds: time,
	};
};

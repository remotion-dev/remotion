import type {
	M3uAssociatedPlaylist,
	M3uStream,
} from '../containers/m3u/get-streams';
import {sampleSorter} from '../containers/m3u/sample-sorter';
import type {LogLevel} from '../log';
import {Log} from '../log';
import type {OnAudioSample, OnVideoSample} from '../webcodec-sample-types';

export type M3uStreamOrInitialUrl =
	| {
			type: 'selected-stream';
			stream: M3uStream;
	  }
	| {
			type: 'initial-url';
			url: string;
	  };

export type ExistingM3uRun = {
	continue: () => Promise<ExistingM3uRun | null>;
	abort: () => void;
};

export const m3uState = (logLevel: LogLevel) => {
	let selectedMainPlaylist: M3uStreamOrInitialUrl | null = null;
	let associatedPlaylists: M3uAssociatedPlaylist[] | null = null;
	const hasEmittedVideoTrack: Record<string, null | OnVideoSample> = {};
	const hasEmittedAudioTrack: Record<string, null | OnAudioSample> = {};
	const hasEmittedDoneWithTracks: Record<string, boolean> = {};
	let hasFinishedManifest = false;

	let readyToIterateOverM3u = false;
	const allChunksProcessed: Record<string, boolean> = {};

	const m3uStreamRuns: Record<string, ExistingM3uRun> = {};
	const tracksDone: Record<string, boolean> = {};

	const getMainPlaylistUrl = () => {
		if (!selectedMainPlaylist) {
			throw new Error('No main playlist selected');
		}

		const playlistUrl =
			selectedMainPlaylist.type === 'initial-url'
				? selectedMainPlaylist.url
				: selectedMainPlaylist.stream.url;
		return playlistUrl;
	};

	const getSelectedPlaylists = () => {
		return [
			getMainPlaylistUrl(),
			...(associatedPlaylists ?? []).map((p) => p.url),
		];
	};

	const getAllChunksProcessedForPlaylist = (src: string) =>
		allChunksProcessed[src];

	return {
		setSelectedMainPlaylist: (stream: M3uStreamOrInitialUrl) => {
			selectedMainPlaylist = stream;
		},
		getSelectedMainPlaylist: () => selectedMainPlaylist,
		setHasEmittedVideoTrack: (src: string, callback: OnVideoSample | null) => {
			hasEmittedVideoTrack[src] = callback;
		},
		hasEmittedVideoTrack: (src: string) => {
			const value = hasEmittedVideoTrack[src];
			if (value === undefined) {
				return false;
			}

			return value;
		},
		setHasEmittedAudioTrack: (src: string, callback: OnAudioSample | null) => {
			hasEmittedAudioTrack[src] = callback;
		},
		hasEmittedAudioTrack: (src: string) => {
			const value = hasEmittedAudioTrack[src];
			if (value === undefined) {
				return false;
			}

			return value;
		},
		setHasEmittedDoneWithTracks: (src: string) => {
			hasEmittedDoneWithTracks[src] = true;
		},
		hasEmittedDoneWithTracks: (src: string) => hasEmittedDoneWithTracks[src],
		setReadyToIterateOverM3u: () => {
			readyToIterateOverM3u = true;
		},
		isReadyToIterateOverM3u: () => readyToIterateOverM3u,
		setAllChunksProcessed: (src: string) => {
			allChunksProcessed[src] = true;
		},
		getAllChunksProcessedForPlaylist,
		getAllChunksProcessedOverall: () => {
			if (!selectedMainPlaylist) {
				return false;
			}

			const selectedPlaylists = getSelectedPlaylists();
			return selectedPlaylists.every((url) => allChunksProcessed[url]);
		},
		setHasFinishedManifest: () => {
			hasFinishedManifest = true;
		},
		hasFinishedManifest: () => hasFinishedManifest,
		setM3uStreamRun: (playlistUrl: string, run: ExistingM3uRun | null) => {
			if (!run) {
				delete m3uStreamRuns[playlistUrl];
				return;
			}

			m3uStreamRuns[playlistUrl] = run;
		},
		setTracksDone: (playlistUrl: string) => {
			tracksDone[playlistUrl] = true;
			const selectedPlaylists = getSelectedPlaylists();
			return selectedPlaylists.every((url) => tracksDone[url]);
		},
		getM3uStreamRun: (playlistUrl: string) =>
			m3uStreamRuns[playlistUrl] ?? null,
		abortM3UStreamRuns: () => {
			const values = Object.values(m3uStreamRuns);
			if (values.length === 0) {
				return;
			}

			Log.trace(logLevel, `Aborting ${values.length} M3U stream runs`);
			values.forEach((run) => {
				run.abort();
			});
		},
		setAssociatedPlaylists: (playlists: M3uAssociatedPlaylist[]) => {
			associatedPlaylists = playlists;
		},
		getAssociatedPlaylists: () => associatedPlaylists,
		getSelectedPlaylists,
		sampleSorter: sampleSorter({logLevel, getAllChunksProcessedForPlaylist}),
	};
};

export type M3uState = ReturnType<typeof m3uState>;

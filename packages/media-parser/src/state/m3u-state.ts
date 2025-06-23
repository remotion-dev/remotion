import type {
	M3uAssociatedPlaylist,
	M3uStream,
} from '../containers/m3u/get-streams';
import {sampleSorter} from '../containers/m3u/sample-sorter';
import type {MediaParserLogLevel} from '../log';
import {Log} from '../log';
import type {IsoBaseMediaStructure} from '../parse-result';
import type {
	MediaParserOnAudioSample,
	MediaParserOnVideoSample,
} from '../webcodec-sample-types';

export type M3uStreamOrInitialUrl =
	| {
			type: 'selected-stream';
			stream: M3uStream;
	  }
	| {
			type: 'initial-url';
			url: string;
	  };

export type M3uRun = {
	continue: () => Promise<M3uRun | null>;
	abort: () => void;
};

type M3uSeek = {
	targetTime: number;
};

export const m3uState = (logLevel: MediaParserLogLevel) => {
	let selectedMainPlaylist: M3uStreamOrInitialUrl | null = null;
	let associatedPlaylists: M3uAssociatedPlaylist[] | null = null;
	const hasEmittedVideoTrack: Record<string, null | MediaParserOnVideoSample> =
		{};
	const hasEmittedAudioTrack: Record<string, null | MediaParserOnAudioSample> =
		{};
	const hasEmittedDoneWithTracks: Record<string, boolean> = {};
	let hasFinishedManifest = false;

	const seekToSecondsToProcess: Record<string, M3uSeek | null> = {};
	const nextSeekShouldSubtractChunks: Record<string, number> = {};

	let readyToIterateOverM3u = false;
	const allChunksProcessed: Record<string, boolean> = {};

	const m3uStreamRuns: Record<string, M3uRun> = {};
	const tracksDone: Record<string, boolean> = {};

	const getMainPlaylistUrl = () => {
		if (!selectedMainPlaylist) {
			throw new Error('No main playlist selected');
		}

		const playlistUrl =
			selectedMainPlaylist.type === 'initial-url'
				? selectedMainPlaylist.url
				: selectedMainPlaylist.stream.src;
		return playlistUrl;
	};

	const getSelectedPlaylists = () => {
		return [
			getMainPlaylistUrl(),
			...(associatedPlaylists ?? []).map((p) => p.src),
		];
	};

	const getAllChunksProcessedForPlaylist = (src: string) =>
		allChunksProcessed[src];

	const mp4HeaderSegments: Record<string, IsoBaseMediaStructure> = {};

	const setMp4HeaderSegment = (
		playlistUrl: string,
		structure: IsoBaseMediaStructure,
	) => {
		mp4HeaderSegments[playlistUrl] = structure;
	};

	const getMp4HeaderSegment = (playlistUrl: string) => {
		return mp4HeaderSegments[playlistUrl];
	};

	return {
		setSelectedMainPlaylist: (stream: M3uStreamOrInitialUrl) => {
			selectedMainPlaylist = stream;
		},
		getSelectedMainPlaylist: () => selectedMainPlaylist,
		setHasEmittedVideoTrack: (
			src: string,
			callback: MediaParserOnVideoSample | null,
		) => {
			hasEmittedVideoTrack[src] = callback;
		},
		hasEmittedVideoTrack: (src: string) => {
			const value = hasEmittedVideoTrack[src];
			if (value === undefined) {
				return false;
			}

			return value;
		},
		setHasEmittedAudioTrack: (
			src: string,
			callback: MediaParserOnAudioSample | null,
		) => {
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
		hasEmittedDoneWithTracks: (src: string) =>
			hasEmittedDoneWithTracks[src] !== undefined,
		setReadyToIterateOverM3u: () => {
			readyToIterateOverM3u = true;
		},
		isReadyToIterateOverM3u: () => readyToIterateOverM3u,
		setAllChunksProcessed: (src: string) => {
			allChunksProcessed[src] = true;
		},
		clearAllChunksProcessed: () => {
			Object.keys(allChunksProcessed).forEach((key) => {
				delete allChunksProcessed[key];
			});
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
		setM3uStreamRun: (playlistUrl: string, run: M3uRun | null) => {
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
		getTrackDone: (playlistUrl: string) => {
			return tracksDone[playlistUrl];
		},
		clearTracksDone: () => {
			Object.keys(tracksDone).forEach((key) => {
				delete tracksDone[key];
			});
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
		setMp4HeaderSegment,
		getMp4HeaderSegment,
		setSeekToSecondsToProcess: (
			playlistUrl: string,
			m3uSeek: M3uSeek | null,
		) => {
			seekToSecondsToProcess[playlistUrl] = m3uSeek;
		},
		getSeekToSecondsToProcess: (playlistUrl: string) =>
			seekToSecondsToProcess[playlistUrl] ?? null,
		setNextSeekShouldSubtractChunks: (playlistUrl: string, chunks: number) => {
			nextSeekShouldSubtractChunks[playlistUrl] = chunks;
		},
		getNextSeekShouldSubtractChunks: (playlistUrl: string) =>
			nextSeekShouldSubtractChunks[playlistUrl] ?? 0,
	};
};

export type M3uState = ReturnType<typeof m3uState>;

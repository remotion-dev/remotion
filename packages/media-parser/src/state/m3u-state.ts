import type {M3uStream} from '../containers/m3u/get-streams';
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
	let selectedStream: M3uStreamOrInitialUrl | null = null;
	let hasEmittedVideoTrack: null | OnVideoSample | false = false;
	let hasEmittedAudioTrack: null | OnAudioSample | false = false;
	let hasEmittedDoneWithTracks = false;
	let hasFinishedManifest = false;

	let readyToIterateOverM3u = false;
	let allChunksProcessed = false;

	const m3uStreamRuns: Record<string, ExistingM3uRun> = {};

	return {
		setSelectedStream: (stream: M3uStreamOrInitialUrl) => {
			selectedStream = stream;
		},
		getSelectedStream: () => selectedStream,
		setHasEmittedVideoTrack: (callback: OnVideoSample | null) => {
			hasEmittedVideoTrack = callback;
		},
		hasEmittedVideoTrack: () => hasEmittedVideoTrack,
		setHasEmittedAudioTrack: (callback: OnAudioSample | null) => {
			hasEmittedAudioTrack = callback;
		},
		hasEmittedAudioTrack: () => hasEmittedAudioTrack,
		setHasEmittedDoneWithTracks: () => {
			hasEmittedDoneWithTracks = true;
		},
		hasEmittedDoneWithTracks: () => hasEmittedDoneWithTracks,
		setReadyToIterateOverM3u: () => {
			readyToIterateOverM3u = true;
		},
		isReadyToIterateOverM3u: () => readyToIterateOverM3u,

		getAllChunksProcessed: () => allChunksProcessed,
		setAllChunksProcessed: () => {
			allChunksProcessed = true;
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
	};
};

export type M3uState = ReturnType<typeof m3uState>;

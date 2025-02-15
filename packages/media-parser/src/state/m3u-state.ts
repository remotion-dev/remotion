import type {M3uStream} from '../containers/m3u/get-streams';

export const m3uState = () => {
	let selectedStream: M3uStream | null = null;
	let hasEmittedVideoTrack = false;
	let hasEmittedAudioTrack = false;
	let hasEmittedDoneWithTracks = false;

	return {
		setSelectedStream: (stream: M3uStream) => {
			selectedStream = stream;
		},
		getSelectedStream: () => selectedStream,
		setHasEmittedVideoTrack: () => {
			hasEmittedVideoTrack = true;
		},
		hasEmittedVideoTrack: () => hasEmittedVideoTrack,
		setHasEmittedAudioTrack: () => {
			hasEmittedAudioTrack = true;
		},
		hasEmittedAudioTrack: () => hasEmittedAudioTrack,
		setHasEmittedDoneWithTracks: () => {
			hasEmittedDoneWithTracks = true;
		},
		hasEmittedDoneWithTracks: () => hasEmittedDoneWithTracks,
	};
};

export type M3uState = ReturnType<typeof m3uState>;

import type {AudioTrack, VideoTrack} from '../../get-tracks';
import {parseMedia} from '../../parse-media';
import type {M3uState} from '../../state/m3u-state';
import {getChunks} from './get-chunks';
import {getPlaylist} from './get-playlist';
import type {M3uStructure} from './types';

export const iteratorOverTsFiles = async ({
	structure,
	onVideoTrack,
	m3uState,
	onAudioTrack,
	onDoneWithTracks,
	playlistUrl,
}: {
	structure: M3uStructure;
	onVideoTrack: (track: VideoTrack) => Promise<void>;
	onAudioTrack: (track: AudioTrack) => Promise<void>;
	onDoneWithTracks: () => void;
	m3uState: M3uState;
	playlistUrl: string;
}) => {
	const playlist = getPlaylist(structure);
	const chunks = getChunks(playlist);

	// TODO: Be able to pause / resume / cancel / seek
	for (const chunk of chunks) {
		const src = new URL(chunk.url, playlistUrl).toString();
		await parseMedia({
			src,
			acknowledgeRemotionLicense: true,
			onTracks: () => {
				if (!m3uState.hasEmittedDoneWithTracks()) {
					m3uState.setHasEmittedDoneWithTracks();
					onDoneWithTracks();
					return null;
				}
			},
			onAudioTrack: async ({track}) => {
				if (m3uState.hasEmittedAudioTrack()) {
					m3uState.setHasEmittedAudioTrack();
					await onAudioTrack(track);
				}

				return null;
			},
			onVideoTrack: async ({track}) => {
				if (!m3uState.hasEmittedVideoTrack()) {
					m3uState.setHasEmittedVideoTrack();
					await onVideoTrack(track);
				}

				return null;
			},
		});
	}
};

export type PlaybackStoreListener = (playing: boolean) => void;

export type PlaybackStore = {
	subscribe: (listener: PlaybackStoreListener) => () => void;
	getSnapshot: () => boolean;
	setPlaying: (playing: boolean) => void;
};

export const buildPlaybackStore = (): PlaybackStore => {
	let playing = false;
	const listeners = new Set<PlaybackStoreListener>();

	return {
		subscribe: (listener: PlaybackStoreListener) => {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		},
		getSnapshot: () => playing,
		setPlaying: (newPlaying: boolean) => {
			if (playing === newPlaying) {
				return;
			}
			playing = newPlaying;
			listeners.forEach((listener) => {
				listener(playing);
			});
		},
	};
};

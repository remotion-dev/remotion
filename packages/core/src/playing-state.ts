export type PlayingController = {
	readonly isPlaying: () => boolean;
	readonly subscribePlaying: (listener: () => void) => () => void;
	readonly setPlaying: (playing: boolean) => void;
};

export const createPlayingController = (
	initialPlaying = false,
): PlayingController => {
	let playing = initialPlaying;
	const listeners = new Set<() => void>();

	return {
		isPlaying: () => playing,
		subscribePlaying: (listener) => {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		},
		setPlaying: (newPlaying) => {
			if (playing === newPlaying) {
				return;
			}

			playing = newPlaying;
			for (const listener of listeners) {
				listener();
			}
		},
	};
};

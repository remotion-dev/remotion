export type PlaybackTransportEvent = 'play' | 'pause';

export type PlaybackTransportListener = (event: PlaybackTransportEvent) => void;

export type PlaybackTransport = {
	getPlaying: () => boolean;
	dispatch: (event: PlaybackTransportEvent) => void;
	subscribe: (listener: PlaybackTransportListener) => {remove: () => void};
};

export const makePlaybackTransport = (): PlaybackTransport => {
	let playing = false;
	let listeners: PlaybackTransportListener[] = [];

	return {
		getPlaying: () => playing,
		dispatch: (event) => {
			playing = event === 'play';
			listeners.forEach((l) => l(event));
		},
		subscribe: (listener) => {
			listeners.push(listener);
			return {
				remove: () => {
					listeners = listeners.filter((l) => l !== listener);
				},
			};
		},
	};
};

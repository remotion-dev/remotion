import type {SyntheticEvent} from 'react';
import type {PlayerEmitter, ThumbnailEmitter} from './event-emitter.js';

export type ThumbnailMethods = {
	getContainerNode: () => HTMLDivElement | null;
	getScale: () => number;
};

export type PlayerMethods = ThumbnailMethods & {
	play: (e?: SyntheticEvent) => void;
	pause: () => void;
	toggle: (e?: SyntheticEvent) => void;
	seekTo: (frame: number) => void;
	getCurrentFrame: () => number;
	requestFullscreen: () => void;
	exitFullscreen: () => void;
	isFullscreen: () => boolean;
	setVolume: (num: number) => void;
	getVolume: () => number;
	isMuted: () => boolean;
	isPlaying: () => boolean;
	mute: () => void;
	unmute: () => void;
	pauseAndReturnToPlayStart: () => void;
};

export type ThumbnailRef = ThumbnailEmitter & ThumbnailMethods;
export type PlayerRef = PlayerEmitter & PlayerMethods;

import type {SyntheticEvent} from 'react';
import type {PlayerEmitter} from './event-emitter';

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
	isFullscreen: () => void;
	setVolume: (num: number) => void;
	getVolume: () => number;
	isMuted: () => boolean;
	isPlaying: () => boolean;
	mute: () => void;
	unmute: () => void;
};

export type ThumbnailRef = PlayerEmitter & ThumbnailMethods;
export type PlayerRef = PlayerEmitter & PlayerMethods;

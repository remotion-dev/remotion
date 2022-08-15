import type {SyntheticEvent} from 'react';
import type {PlayerEmitter} from './event-emitter';

export type PlayerMethods = {
	play: (e?: SyntheticEvent) => void;
	pause: () => void;
	toggle: (e?: SyntheticEvent) => void;
	seekTo: (frame: number) => void;
	getContainerNode: () => HTMLDivElement | null;
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

export type PlayerRef = PlayerEmitter & PlayerMethods;

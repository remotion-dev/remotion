import {PlayerEmitter} from './event-emitter';

export type PlayerMethods = {
	play: () => void;
	pause: () => void;
	toggle: () => void;
	seekTo: (frame: number) => void;
	getCurrentFrame: () => number;
	requestFullscreen: () => void;
	exitFullscreen: () => void;
	isFullscreen: () => void;
	setVolume: (num: number) => void;
	getVolume: () => number;
	isMuted: () => boolean;
	mute: () => void;
	unmute: () => void;
};

export type PlayerRef = PlayerEmitter & PlayerMethods;

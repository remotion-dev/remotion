import {PlayerEventTarget} from './event-emitter';

export type PlayerMethods = {
	play: () => void;
	pause: () => void;
	toggle: () => void;
	seekTo: (frame: number) => void;
	getCurrentFrame: () => number;
	requestFullscreen: () => void;
	exitFullscreen: () => void;
	isFullscreen: () => void;
};

export type PlayerRef = PlayerEventTarget & PlayerMethods;

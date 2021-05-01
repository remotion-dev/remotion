import {PlayerEventTarget} from './event-emitter';

export type PlayerMethods = {
	play: () => void;
	pause: () => void;
	toggle: () => void;
	seekTo: (frame: number) => void;
};

export type PlayerRef = PlayerEventTarget & PlayerMethods;

import type {AudioCodec, VideoCodec} from 'mediabunny';
import type {MediabunnyResize} from './mediabunny-calculate-resize-option';

export type AudioOperation =
	| {
			type: 'reencode';
			bitrate: number;
			audioCodec: AudioCodec;
			sampleRate: number | null;
	  }
	| {type: 'copy'}
	| {type: 'fail'}
	| {type: 'drop'};

export type VideoOperation =
	| {
			type: 'reencode';
			videoCodec: VideoCodec;
			rotate?: number;
			resize?: MediabunnyResize | null;
	  }
	| {type: 'copy'}
	| {type: 'drop'}
	| {type: 'fail'};

import type {AudioTrack, VideoTrack} from './get-tracks';

export type AudioSample = {
	bytes: Uint8Array;
	timestamp: number;
	offset: number;
	trackId: number;
	type: 'key' | 'delta';
};

export type VideoSample = {
	bytes: Uint8Array;
	timestamp: number;
	duration: number | undefined;
	trackId: number;
	type: 'key' | 'delta';
	cts: number | null;
	dts: number | null;
};

export type OnAudioSample = (sample: AudioSample) => void;
export type OnVideoSample = (sample: VideoSample) => void;

export type OnAudioTrack = (track: AudioTrack) => OnAudioSample | null;
export type OnVideoTrack = (track: VideoTrack) => OnVideoSample | null;

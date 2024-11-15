import type {AudioTrack, VideoTrack} from './get-tracks';

export type AudioSample = {
	data: Uint8Array;
	timestamp: number;
	trackId: number;
	type: 'key' | 'delta';
	duration: number | undefined;
	cts: number;
	dts: number;
};

export type VideoSample = {
	data: Uint8Array;
	timestamp: number;
	duration: number | undefined;
	trackId: number;
	type: 'key' | 'delta';
	cts: number;
	dts: number;
};

export type OnAudioSample = (sample: AudioSample) => void | Promise<void>;
export type OnVideoSample = (sample: VideoSample) => void | Promise<void>;

export type OnAudioTrack = (
	track: AudioTrack,
) => OnAudioSample | Promise<OnAudioSample | null> | null;

export type OnVideoTrack = (
	track: VideoTrack,
) => OnVideoSample | Promise<OnVideoSample | null> | null;

export type AudioOrVideoSample = {
	timestamp: number;
	type: 'key' | 'delta';
	data: Uint8Array;
	duration: number | undefined;
	cts: number;
	dts: number;
};

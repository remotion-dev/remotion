import type {AudioTrack, VideoTrack} from './get-tracks';

export type OnAudioSample = (
	sample: AudioOrVideoSample,
) => void | Promise<void>;
export type OnVideoSample = (
	sample: AudioOrVideoSample,
) => void | Promise<void>;

export type OnAudioTrack = (
	track: AudioTrack,
) => OnAudioSample | Promise<OnAudioSample | null> | null;

export type OnVideoTrack = (
	track: VideoTrack,
) => OnVideoSample | Promise<OnVideoSample | null> | null;

export type AudioOrVideoSample = {
	data: Uint8Array;
	timestamp: number;
	duration: number | undefined;
	trackId: number;
	type: 'key' | 'delta';
	cts: number;
	dts: number;
};

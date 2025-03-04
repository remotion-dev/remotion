import type {AudioTrack, VideoTrack} from './get-tracks';
import type {MediaParserContainer} from './options';

export type OnAudioSample = (
	sample: AudioOrVideoSample,
) => void | Promise<void>;
export type OnVideoSample = (
	sample: AudioOrVideoSample,
) => void | Promise<void>;

export type OnAudioTrackParams = {
	track: AudioTrack;
	container: MediaParserContainer;
};

export type OnAudioTrack = (
	options: OnAudioTrackParams,
) => OnAudioSample | Promise<OnAudioSample | null> | null;

export type OnVideoTrackParams = {
	track: VideoTrack;
	container: MediaParserContainer;
};

export type OnVideoTrack = (
	options: OnVideoTrackParams,
) => OnVideoSample | Promise<OnVideoSample | null> | null;

export type AudioOrVideoSample = {
	data: Uint8Array;
	timestamp: number;
	duration: number | undefined;
	trackId: number;
	type: 'key' | 'delta';
	cts: number;
	dts: number;
	offset: number;
	timescale: number;
};

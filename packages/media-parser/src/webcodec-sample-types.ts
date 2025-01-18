import type {AudioTrack, VideoTrack} from './get-tracks';
import type {MediaParserContainer} from './options';

export type OnAudioSample = (
	sample: AudioOrVideoSample,
) => void | Promise<void>;
export type OnVideoSample = (
	sample: AudioOrVideoSample,
) => void | Promise<void>;

export type OnAudioTrack = (options: {
	track: AudioTrack;
	container: MediaParserContainer;
}) => OnAudioSample | Promise<OnAudioSample | null> | null;

export type OnVideoTrack = (options: {
	track: VideoTrack;
	container: MediaParserContainer;
}) => OnVideoSample | Promise<OnVideoSample | null> | null;

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

import type {MediaParserAudioTrack, MediaParserVideoTrack} from './get-tracks';
import type {MediaParserContainer} from './options';

export type OnAudioSample = (
	sample: MediaParserAudioSample,
) => void | Promise<void>;
export type OnVideoSample = (
	sample: MediaParserVideoSample,
) => void | Promise<void>;

export type OnAudioTrackParams = {
	track: MediaParserAudioTrack;
	container: MediaParserContainer;
};

export type OnAudioTrack = (
	options: OnAudioTrackParams,
) => OnAudioSample | Promise<OnAudioSample | null> | null;

export type OnVideoTrackParams = {
	track: MediaParserVideoTrack;
	container: MediaParserContainer;
};

export type OnVideoTrack = (
	options: OnVideoTrackParams,
) => OnVideoSample | Promise<OnVideoSample | null> | null;

// These types are the same, but maybe we add more info in the future
// Therefore keeping it separate for now
export type MediaParserAudioSample = {
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

export type MediaParserVideoSample = {
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

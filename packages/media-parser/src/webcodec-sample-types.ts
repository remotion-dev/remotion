import type {MediaParserAudioTrack, MediaParserVideoTrack} from './get-tracks';
import type {MediaParserContainer} from './options';

export type MediaParserOnAudioSample = (
	sample: MediaParserAudioSample,
) => void | Promise<void>;

export type MediaParserOnVideoSample = (
	sample: MediaParserVideoSample,
) => void | Promise<void>;

export type MediaParserOnAudioTrackParams = {
	track: MediaParserAudioTrack;
	container: MediaParserContainer;
};

export type MediaParserOnAudioTrack = (
	options: MediaParserOnAudioTrackParams,
) => MediaParserOnAudioSample | Promise<MediaParserOnAudioSample | null> | null;

export type MediaParserOnVideoTrackParams = {
	track: MediaParserVideoTrack;
	container: MediaParserContainer;
};

export type MediaParserOnVideoTrack = (
	options: MediaParserOnVideoTrackParams,
) => MediaParserOnVideoSample | Promise<MediaParserOnVideoSample | null> | null;

// These types are the same, but maybe we add more info in the future
// Therefore keeping it separate for now
export type MediaParserAudioSample = {
	// Used by WebCodecs
	data: Uint8Array;
	timestamp: number;
	duration: number | undefined;
	type: 'key' | 'delta';
	// Not used by WebCodecs
	trackId: number;
	decodingTimestamp: number;
	offset: number;
	timescale: number;
};

export type MediaParserAvcKeyframeInfo = {
	type: 'keyframe';
	poc: number | null;
};

export type MediaParserAvcDeltaFrameInfo = {
	type: 'delta-frame';
	isBidirectionalFrame: boolean;
	poc: number | null;
};

export type MediaParserAvcExtraInfo =
	| MediaParserAvcKeyframeInfo
	| MediaParserAvcDeltaFrameInfo;

export type MediaParserVideoSample = {
	// Used by WebCodecs
	data: Uint8Array;
	timestamp: number;
	type: 'key' | 'delta';
	duration: number | undefined;
	timescale: number;
	// Not used by WebCodecs
	trackId: number;
	decodingTimestamp: number;
	offset: number;
	avc?: MediaParserAvcExtraInfo;
};

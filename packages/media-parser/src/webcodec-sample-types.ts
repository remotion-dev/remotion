import type {MediaParserAudioTrack, MediaParserVideoTrack} from './get-tracks';
import type {MediaParserContainer} from './options';

export type MediaParserOnAudioSample = (
	sample: MediaParserAudioSample,
) =>
	| void
	| Promise<OnTrackDoneCallback | void>
	| Promise<void>
	| OnTrackDoneCallback;

export type MediaParserOnVideoSample = (
	sample: MediaParserVideoSample,
) =>
	| void
	| Promise<OnTrackDoneCallback | void>
	| Promise<void>
	| OnTrackDoneCallback;

export type OnTrackDoneCallback = () => void | Promise<void>;

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
	decodingTimestamp: number;
	offset: number;
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
	// Not used by WebCodecs
	decodingTimestamp: number;
	offset: number;
	avc?: MediaParserAvcExtraInfo;
};

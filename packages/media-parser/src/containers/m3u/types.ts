import type {ParseMediaSrc} from '../../options';

export type M3uHeader = {
	type: 'm3u-header';
};

export type M3uVersion = {
	type: 'm3u-version';
	version: string;
};

export type M3uIndependentSegments = {
	type: 'm3u-independent-segments';
};

export type M3uMedia = {
	type: 'm3u-media';
};

export type M3uTargetDuration = {
	type: 'm3u-target-duration';
	duration: number;
};

export type M3uPlaylistType = {
	type: 'm3u-playlist-type';
	playlistType: string;
};

export type M3uPlaylist = {
	type: 'm3u-playlist';
	boxes: M3uBox[];
	src: ParseMediaSrc;
};

export type M3uExtInf = {
	type: 'm3u-extinf';
	value: number;
};

export type M3uEndList = {
	type: 'm3u-endlist';
};

export type M3uMediaSequence = {
	type: 'm3u-media-sequence';
	value: number;
};

export type M3uDiscontinuitySequence = {
	type: 'm3u-discontinuity-sequence';
	value: number;
};

export type M3uIFrameStreamInfo = {
	type: 'm3u-i-frame-stream-info';
};

export type M3uMap = {
	type: 'm3u-map';
	value: string;
};

export type M3uStreamInfo = {
	type: 'm3u-stream-info';
	bandwidthInBitsPerSec: number | null;
	averageBandwidthInBitsPerSec: number | null;
	codecs: string[] | null;
	dimensions: {
		width: number;
		height: number;
	} | null;
	audio: string | null;
};

export type M3uMediaInfo = {
	type: 'm3u-media-info';
	groupId: string;
	language: string | null;
	name: string | null;
	autoselect: boolean;
	default: boolean;
	channels: number | null;
	uri: string;
	mediaType: string | null;
};

export type M3uTextValue = {
	type: 'm3u-text-value';
	value: string;
};

export type M3uAllowCache = {
	type: 'm3u-allow-cache';
	allowsCache: boolean;
};

export type M3uProgramDateTime = {
	type: 'm3u-program-date-time';
	dateTime: string;
};

export type M3uBox =
	| M3uHeader
	| M3uPlaylist
	| M3uVersion
	| M3uIndependentSegments
	| M3uStreamInfo
	| M3uTargetDuration
	| M3uPlaylistType
	| M3uExtInf
	| M3uMedia
	| M3uMediaInfo
	| M3uEndList
	| M3uMediaSequence
	| M3uDiscontinuitySequence
	| M3uMap
	| M3uIFrameStreamInfo
	| M3uTextValue
	| M3uAllowCache
	| M3uProgramDateTime;

export type M3uStructure = {
	type: 'm3u';
	boxes: M3uBox[];
};

import type {AudioTrack, OtherTrack, VideoTrack} from '../../get-tracks';
import type {RiffStructure} from '../../parse-result';
import type {StrfBoxAudio, StrfBoxVideo, StrhBox} from './riff-box';
import {
	getAvihBox,
	getStrfBox,
	getStrhBox,
	getStrlBoxes,
	isRiffAvi,
} from './traversal';

export type AllTracks = {
	videoTracks: VideoTrack[];
	audioTracks: AudioTrack[];
	otherTracks: OtherTrack[];
};

export const getNumberOfTracks = (structure: RiffStructure): number => {
	const avihBox = getAvihBox(structure);
	if (avihBox) {
		return avihBox.streams;
	}

	throw new Error('No avih box found');
};

export const makeAviAudioTrack = ({
	strh,
	strf,
	index,
}: {
	strh: StrhBox;
	strf: StrfBoxAudio;
	index: number;
}): AudioTrack => {
	// 255 = AAC
	if (strf.formatTag !== 255) {
		throw new Error(`Unsupported audio format ${strf.formatTag}`);
	}

	return {
		type: 'audio',
		codec: 'mp4a.40.2', // According to Claude 3.5 Sonnet
		codecPrivate: null,
		codecWithoutConfig: 'aac',
		description: undefined,
		numberOfChannels: strf.numberOfChannels,
		sampleRate: strf.sampleRate,
		timescale: strh.rate,
		trackId: index,
		trakBox: null,
	};
};

export const makeAviVideoTrack = ({
	strh,
	strf,
	index,
}: {
	strh: StrhBox;
	strf: StrfBoxVideo;
	index: number;
}): VideoTrack => {
	if (strh.handler !== 'H264') {
		throw new Error(`Unsupported video codec ${strh.handler}`);
	}

	return {
		codecPrivate: null,
		// TODO: Which avc1?
		codec: 'avc1',
		codecWithoutConfig: 'h264',
		codedHeight: strf.height,
		codedWidth: strf.width,
		width: strf.width,
		height: strf.height,
		type: 'video',
		displayAspectHeight: strf.height,
		timescale: strh.rate,
		description: undefined,
		trackId: index,
		color: {
			fullRange: null,
			matrixCoefficients: null,
			primaries: null,
			transferCharacteristics: null,
		},
		displayAspectWidth: strf.width,
		trakBox: null,
		rotation: 0,
		sampleAspectRatio: {
			numerator: 1,
			denominator: 1,
		},
		fps: strh.rate / strh.scale,
	};
};

export const getTracksFromAvi = (structure: RiffStructure): AllTracks => {
	if (!isRiffAvi(structure)) {
		throw new Error('Not an AVI file');
	}

	const videoTracks: VideoTrack[] = [];
	const audioTracks: AudioTrack[] = [];
	const otherTracks: OtherTrack[] = [];

	const boxes = getStrlBoxes(structure);

	let i = 0;
	for (const box of boxes) {
		const strh = getStrhBox(box.children);
		const strf = getStrfBox(box.children);
		if (!strh || !strf) {
			continue;
		}

		if (strf.type === 'strf-box-video') {
			videoTracks.push(makeAviVideoTrack({strh, strf, index: i}));
		} else if (strh.fccType === 'auds') {
			audioTracks.push(makeAviAudioTrack({strh, strf, index: i}));
		} else {
			throw new Error(`Unsupported track type ${strh.fccType}`);
		}

		i++;
	}

	return {audioTracks, otherTracks, videoTracks};
};

export const hasAllTracksFromAvi = (structure: RiffStructure): boolean => {
	if (!isRiffAvi(structure)) {
		throw new Error('Not an AVI file');
	}

	const numberOfTracks = getNumberOfTracks(structure);
	const tracks = getTracksFromAvi(structure);
	return (
		tracks.videoTracks.length +
			tracks.audioTracks.length +
			tracks.otherTracks.length ===
		numberOfTracks
	);
};

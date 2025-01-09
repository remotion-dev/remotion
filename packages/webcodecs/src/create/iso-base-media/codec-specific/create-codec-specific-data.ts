import type {MakeTrackAudio, MakeTrackVideo} from '../../make-track-info';
import {createAvccBox} from '../trak/mdia/minf/stbl/stsd/create-avcc';
import {createPasp} from '../trak/mdia/minf/stbl/stsd/create-pasp';
import {createAvc1Data} from './avc1';
import {createMp4a} from './mp4a';

export type Avc1Data = {
	pasp: Uint8Array;
	avccBox: Uint8Array;
	width: number;
	height: number;
	horizontalResolution: number;
	verticalResolution: number;
	compressorName: string;
	depth: number;
	type: 'avc1-data';
};

export type Mp4aData = {
	type: 'mp4a-data';
	sampleRate: number;
	channelCount: number;
	maxBitrate: number;
	avgBitrate: number;
	codecPrivate: Uint8Array | null;
};

export type CodecSpecificData = Avc1Data | Mp4aData;

export const createCodecSpecificData = (
	track: MakeTrackAudio | MakeTrackVideo,
) => {
	if (track.type === 'video') {
		return createAvc1Data({
			avccBox: createAvccBox(track.codecPrivate),
			compressorName: 'WebCodecs',
			depth: 24,
			horizontalResolution: 72,
			verticalResolution: 72,
			height: track.height,
			width: track.width,
			pasp: createPasp(1, 1),
			type: 'avc1-data',
		});
	}

	if (track.type === 'audio') {
		return createMp4a({
			type: 'mp4a-data',
			// TODO: Put in values based on real data,
			// this seems to work though
			avgBitrate: 128 * 1024,
			maxBitrate: 128 * 1024,
			channelCount: track.numberOfChannels,
			sampleRate: track.sampleRate,
			codecPrivate: track.codecPrivate,
		});
	}

	throw new Error('Unsupported codec specific data ' + (track satisfies never));
};

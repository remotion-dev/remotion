import type {SamplePosition} from '../../get-sample-positions';
import type {MakeTrackAudio, MakeTrackVideo} from '../make-track-info';
import {createMdia} from './create-mdia';
import {createTrak} from './create-trak';
import {createMdhd} from './mdia/create-mdhd';
import {IDENTITY_MATRIX} from './primitives';
import {createTkhd, TKHD_FLAGS} from './trak/create-tkhd';
import {createElstItem} from './trak/edts/create-elst';
import {createMinf} from './trak/mdia/create-minf';
import {createStbl} from './trak/mdia/minf/create-stbl';
import {createVmhd} from './trak/mdia/minf/create-vmhd';
import {createAvccBox} from './trak/mdia/minf/stbl/stsd/create-avcc';
import {createBtrt} from './trak/mdia/minf/stbl/stsd/create-btrt';
import {createPasp} from './trak/mdia/minf/stbl/stsd/create-pasp';
import {createHdlr} from './udta/meta/create-hdlr';

export const ISO_BASE_TIMESCALE = 1000;

export type IsoBaseMediaTrackData = {
	track: MakeTrackVideo | MakeTrackAudio;
	durationInUnits: number;
	samplePositions: SamplePosition[];
};

export const serializeTrack = ({
	track,
	durationInUnits,
	samplePositions,
}: IsoBaseMediaTrackData) => {
	console.log(track);
	if (track.codec !== 'h264') {
		throw new Error('Currently only H.264 is supported');
	}

	if (!track.codecPrivate) {
		throw new Error('Missing codecPrivate');
	}

	return createTrak({
		tkhd: createTkhd({
			creationTime: null,
			modificationTime: null,
			duration: durationInUnits,
			flags: TKHD_FLAGS.TRACK_ENABLED | TKHD_FLAGS.TRACK_IN_MOVIE,
			height: track.height,
			width: track.width,
			matrix: IDENTITY_MATRIX,
			trackId: track.trackNumber,
			volume: 1,
		}),
		edts: createElstItem({
			segmentDuration: durationInUnits,
			mediaTime: 0,
		}),
		mdia: createMdia({
			mdhd: createMdhd({
				creationTime: null,
				modificationTime: null,
				duration: durationInUnits,
				timescale: ISO_BASE_TIMESCALE,
			}),
			hdlr: track.type === 'video' ? createHdlr('video') : createHdlr('audio'),
			minf: createMinf({
				stblAtom: createStbl({
					samplePositions,
					codecSpecificData: {
						avccBox: createAvccBox(track.codecPrivate),
						// TODO: Investigate which values to put in
						btrt: createBtrt({maxBitrate: 437875, avgBitrate: 437875}),
						compressorName: '',
						depth: 24,
						horizontalResolution: 72,
						verticalResolution: 72,
						height: track.height,
						width: track.width,
						pasp: createPasp(1, 1),
						type: 'avc1-data',
					},
				}),
				vmhdAtom: createVmhd(),
			}),
		}),
	});
};

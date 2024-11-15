import type {SamplePosition} from '../../get-sample-positions';
import type {MakeTrackAudio, MakeTrackVideo} from '../make-track-info';
import {createMdia} from './create-mdia';
import {createTrak} from './create-trak';
import {createMdhd} from './mdia/create-mdhd';
import {IDENTITY_MATRIX, stringsToUint8Array} from './primitives';
import {
	createTkhdForAudio,
	createTkhdForVideo,
	TKHD_FLAGS,
} from './trak/create-tkhd';
import {createMinf} from './trak/mdia/create-minf';
import {createSmhd} from './trak/mdia/minf/create-smhd';
import {createStbl} from './trak/mdia/minf/create-stbl';
import {createVmhd} from './trak/mdia/minf/create-vmhd';
import {createAvccBox} from './trak/mdia/minf/stbl/stsd/create-avcc';
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
	if (track.codec !== 'h264' && track.codec !== 'aac') {
		throw new Error('Currently only H.264 and AAC is supported');
	}

	return createTrak({
		tkhd:
			track.codec === 'aac'
				? createTkhdForAudio({
						creationTime: Date.now(),
						flags: TKHD_FLAGS.TRACK_ENABLED | TKHD_FLAGS.TRACK_IN_MOVIE,
						modificationTime: Date.now(),
						duration: durationInUnits,
						trackId: track.trackNumber,
						volume: 1,
					})
				: track.type === 'video'
					? createTkhdForVideo({
							creationTime: Date.now(),
							modificationTime: Date.now(),
							duration: durationInUnits,
							flags: TKHD_FLAGS.TRACK_ENABLED | TKHD_FLAGS.TRACK_IN_MOVIE,
							height: track.height,
							width: track.width,
							matrix: IDENTITY_MATRIX,
							trackId: track.trackNumber,
							volume: 1,
						})
					: new Uint8Array(stringsToUint8Array('wrong')),
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
					isVideo: track.type === 'video',
					codecSpecificData:
						track.type === 'audio'
							? {
									type: 'mp4a-data',
									// TODO: Investigate which values to put in
									avgBitrate: 317370,
									maxBitrate: 319999,
									channelCount: track.numberOfChannels,
									sampleRate: track.sampleRate,
								}
							: {
									avccBox: createAvccBox(track.codecPrivate),
									// TODO: Investigate which values to put in
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
				vmhdAtom: track.type === 'audio' ? createSmhd() : createVmhd(),
			}),
		}),
	});
};

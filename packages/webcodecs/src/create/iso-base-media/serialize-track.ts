import type {SamplePosition} from '@remotion/media-parser';
import type {MakeTrackAudio, MakeTrackVideo} from '../make-track-info';
import {createCodecSpecificData} from './codec-specific/create-codec-specific-data';
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
import {createHdlr} from './udta/meta/create-hdlr';

export type IsoBaseMediaTrackData = {
	track: MakeTrackVideo | MakeTrackAudio;
	durationInUnits: number;
	samplePositions: SamplePosition[];
	timescale: number;
};

export const serializeTrack = ({
	track,
	durationInUnits,
	samplePositions,
	timescale,
}: IsoBaseMediaTrackData) => {
	if (
		track.codec !== 'h264' &&
		track.codec !== 'h265' &&
		track.codec !== 'aac'
	) {
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
						timescale,
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
							volume: 0,
							timescale,
						})
					: new Uint8Array(stringsToUint8Array('wrong')),
		mdia: createMdia({
			mdhd: createMdhd({
				creationTime: null,
				modificationTime: null,
				duration: durationInUnits,
				timescale: track.timescale,
			}),
			hdlr: track.type === 'video' ? createHdlr('video') : createHdlr('audio'),
			minf: createMinf({
				stblAtom: createStbl({
					samplePositions,
					isVideo: track.type === 'video',
					codecSpecificData: createCodecSpecificData(track),
				}),
				vmhdAtom: track.type === 'audio' ? createSmhd() : createVmhd(),
			}),
		}),
	});
};

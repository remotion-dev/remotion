import {VERSION} from '@remotion/media-parser';
import {createIlst} from './create-ilst';
import {createMoov} from './create-moov';
import {createMvhd} from './create-mvhd';
import {createUdta} from './create-udta';
import {createCmt} from './ilst/create-cmt';
import {createToo} from './ilst/create-too';
import {IDENTITY_MATRIX, padIsoBaseMediaBytes} from './primitives';
import type {IsoBaseMediaTrackData} from './serialize-track';
import {serializeTrack} from './serialize-track';
import {createMeta} from './udta/create-meta';
import {createHdlr} from './udta/meta/create-hdlr';

// TODO: Creates a header that is way too large
const HEADER_LENGTH = 2048_000;

export const createPaddedMoovAtom = ({
	durationInUnits,
	trackInfo,
	timescale,
}: {
	durationInUnits: number;
	trackInfo: IsoBaseMediaTrackData[];
	timescale: number;
}) => {
	return padIsoBaseMediaBytes(
		createMoov({
			mvhd: createMvhd({
				timescale,
				durationInUnits,
				matrix: IDENTITY_MATRIX,
				nextTrackId:
					trackInfo
						.map((t) => t.track.trackNumber)
						.reduce((a, b) => Math.max(a, b), 0) + 1,
				rate: 1,
				volume: 1,
				creationTime: Date.now(),
				modificationTime: Date.now(),
			}),
			traks: trackInfo.map((track) => {
				return serializeTrack({
					timescale,
					track: track.track,
					durationInUnits,
					samplePositions: track.samplePositions,
				});
			}),
			udta: createUdta(
				createMeta({
					hdlr: createHdlr('mdir'),
					ilst: createIlst([
						createToo('WebCodecs'),
						createCmt(`Made with @remotion/webcodecs ${VERSION}`),
					]),
				}),
			),
		}),
		HEADER_LENGTH,
	);
};

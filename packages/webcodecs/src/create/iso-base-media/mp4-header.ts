import type {MediaParserLogLevel} from '@remotion/media-parser';
import {VERSION} from '@remotion/media-parser';
import {Log} from '../../log';
import {createIlst} from './create-ilst';
import {createMoov} from './create-moov';
import {createMvhd} from './create-mvhd';
import {createUdta} from './create-udta';
import {calculateAReasonableMp4HeaderLength} from './header-length';
import {createCmt} from './ilst/create-cmt';
import {createToo} from './ilst/create-too';
import {IDENTITY_MATRIX, padIsoBaseMediaBytes} from './primitives';
import type {IsoBaseMediaTrackData} from './serialize-track';
import {serializeTrack} from './serialize-track';
import {createMeta} from './udta/create-meta';
import {createHdlr} from './udta/meta/create-hdlr';

export const createPaddedMoovAtom = ({
	durationInUnits,
	trackInfo,
	timescale,
	expectedDurationInSeconds,
	logLevel,
	expectedFrameRate,
}: {
	durationInUnits: number;
	trackInfo: IsoBaseMediaTrackData[];
	timescale: number;
	expectedDurationInSeconds: number | null;
	logLevel: MediaParserLogLevel;
	expectedFrameRate: number | null;
}) => {
	const headerLength = calculateAReasonableMp4HeaderLength({
		expectedDurationInSeconds,
		expectedFrameRate,
	});
	if (expectedDurationInSeconds !== null) {
		Log.verbose(
			logLevel,
			`Expecting duration of the video to be ${expectedDurationInSeconds} seconds, allocating ${headerLength} bytes for the MP4 header.`,
		);
	} else {
		Log.verbose(
			logLevel,
			`No duration was provided, allocating ${headerLength} bytes for the MP4 header.`,
		);
	}

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
		headerLength,
	);
};

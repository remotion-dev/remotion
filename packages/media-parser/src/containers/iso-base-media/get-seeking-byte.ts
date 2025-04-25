import {getTracksFromIsoBaseMedia} from '../../get-tracks';
import type {LogLevel} from '../../log';
import {Log} from '../../log';
import type {IsoBaseMediaStructure} from '../../parse-result';
import type {IsoBaseMediaSeekingHints} from '../../seeking-hints';
import type {IsoBaseMediaState} from '../../state/iso-base-media/iso-state';
import type {StructureState} from '../../state/structure';
import type {SeekResolution} from '../../work-on-seek-request';
import {findKeyframeBeforeTime} from './find-keyframe-before-time';
import {findTrackToSeek} from './find-track-to-seek';
import {getSeekingByteFromFragmentedMp4} from './get-seeking-byte-from-fragmented-mp4';
import {getMoovBoxFromState} from './traversal';

export const getSeekingByteFromIsoBaseMedia = ({
	info,
	time,
	logLevel,
	currentPosition,
	isoState,
	mp4HeaderSegment,
	structure,
}: {
	info: IsoBaseMediaSeekingHints;
	time: number;
	logLevel: LogLevel;
	currentPosition: number;
	isoState: IsoBaseMediaState;
	mp4HeaderSegment: IsoBaseMediaStructure | null;
	structure: StructureState;
}): Promise<SeekResolution> => {
	const tracks = getTracksFromIsoBaseMedia({
		isoState,
		mp4HeaderSegment,
		structure,
		mayUsePrecomputed: false,
	});
	const allTracks = [
		...tracks.videoTracks,
		...tracks.audioTracks,
		...tracks.otherTracks,
	];

	const hasMoov = Boolean(
		getMoovBoxFromState({
			mp4HeaderSegment,
			structureState: structure,
			isoState,
			mayUsePrecomputed: false,
		}),
	);

	if (!hasMoov) {
		Log.trace(logLevel, 'No moov box found, must wait');
		return Promise.resolve({
			type: 'valid-but-must-wait',
		});
	}

	if (info.moofBoxes.length > 0) {
		return getSeekingByteFromFragmentedMp4({
			info,
			time,
			logLevel,
			currentPosition,
			isoState,
			allTracks,
		});
	}

	const {track, samplePositions} = findTrackToSeek(allTracks);

	const keyframe = findKeyframeBeforeTime({
		samplePositions,
		time,
		timescale: track.timescale,
		logLevel,
		mediaSections: info.mediaSections,
	});

	if (keyframe) {
		return Promise.resolve({
			type: 'do-seek',
			byte: keyframe,
		});
	}

	return Promise.resolve({
		type: 'invalid',
	});
};

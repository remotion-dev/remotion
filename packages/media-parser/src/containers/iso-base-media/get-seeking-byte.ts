import {getTracksFromIsoBaseMedia} from '../../get-tracks';
import type {MediaParserLogLevel} from '../../log';
import {Log} from '../../log';
import type {M3uPlaylistContext} from '../../options';
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
	m3uPlaylistContext,
	structure,
}: {
	info: IsoBaseMediaSeekingHints;
	time: number;
	logLevel: MediaParserLogLevel;
	currentPosition: number;
	isoState: IsoBaseMediaState;
	m3uPlaylistContext: M3uPlaylistContext | null;
	structure: StructureState;
}): Promise<SeekResolution> => {
	const tracks = getTracksFromIsoBaseMedia({
		isoState,
		m3uPlaylistContext,
		structure,
		mayUsePrecomputed: false,
	});

	const hasMoov = Boolean(
		getMoovBoxFromState({
			structureState: structure,
			isoState,
			mayUsePrecomputed: false,
			mp4HeaderSegment: m3uPlaylistContext?.mp4HeaderSegment ?? null,
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
			tracks,
			isLastChunkInPlaylist: m3uPlaylistContext?.isLastChunkInPlaylist ?? false,
			structure,
			mp4HeaderSegment: m3uPlaylistContext?.mp4HeaderSegment ?? null,
		});
	}

	const trackWithSamplePositions = findTrackToSeek(tracks, structure);
	if (!trackWithSamplePositions) {
		return Promise.resolve({
			type: 'valid-but-must-wait',
		});
	}

	const {track, samplePositions} = trackWithSamplePositions;

	const keyframe = findKeyframeBeforeTime({
		samplePositions,
		time,
		timescale: track.originalTimescale,
		logLevel,
		mediaSections: info.mediaSections,
		startInSeconds: track.startInSeconds,
	});

	if (keyframe) {
		return Promise.resolve({
			type: 'do-seek',
			byte: keyframe.offset,
			timeInSeconds:
				Math.min(keyframe.decodingTimestamp, keyframe.timestamp) /
				track.originalTimescale,
		});
	}

	return Promise.resolve({
		type: 'invalid',
	});
};

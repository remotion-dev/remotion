import type {MediaParserTrack} from '../../get-tracks';
import type {WebmState} from '../../state/matroska/webm';
import type {StructureState} from '../../state/structure';
import {getCodecStringFromSpsAndPps} from '../avc/codec-string';
import {
	getTrack,
	NO_CODEC_PRIVATE_SHOULD_BE_DERIVED_FROM_SPS,
} from './make-track';
import {getMainSegment, getTracksSegment} from './traversal';

export type ResolvedAndUnresolvedTracks = {
	resolved: MediaParserTrack[];
	missingInfo: MediaParserTrack[];
};

export const getTracksFromMatroska = ({
	structureState,
	webmState,
}: {
	structureState: StructureState;
	webmState: WebmState;
}): ResolvedAndUnresolvedTracks => {
	const structure = structureState.getMatroskaStructure();
	const mainSegment = getMainSegment(structure.boxes);
	if (!mainSegment) {
		throw new Error('No main segment');
	}

	const tracksSegment = getTracksSegment(mainSegment);

	if (!tracksSegment) {
		throw new Error('No tracks segment');
	}

	const resolvedTracks: MediaParserTrack[] = [];
	const missingInfo: MediaParserTrack[] = [];

	for (const trackEntrySegment of tracksSegment.value) {
		if (trackEntrySegment.type === 'Crc32') {
			continue;
		}

		if (trackEntrySegment.type !== 'TrackEntry') {
			throw new Error('Expected track entry segment');
		}

		const track = getTrack({
			track: trackEntrySegment,
			timescale: webmState.getTimescale(),
		});

		if (!track) {
			continue;
		}

		if (track.codec === NO_CODEC_PRIVATE_SHOULD_BE_DERIVED_FROM_SPS) {
			const avc = webmState.getAvcProfileForTrackNumber(track.trackId);
			if (avc) {
				resolvedTracks.push({
					...track,
					codec: getCodecStringFromSpsAndPps(avc),
				});
			} else {
				missingInfo.push(track);
			}
		} else {
			resolvedTracks.push(track);
		}
	}

	return {missingInfo, resolved: resolvedTracks};
};

export const matroskaHasTracks = ({
	structureState,
	webmState,
}: {
	structureState: StructureState;
	webmState: WebmState;
}) => {
	const structure = structureState.getMatroskaStructure();
	const mainSegment = getMainSegment(structure.boxes);
	if (!mainSegment) {
		return false;
	}

	return (
		getTracksSegment(mainSegment) !== null &&
		getTracksFromMatroska({
			structureState,
			webmState,
		}).missingInfo.length === 0
	);
};

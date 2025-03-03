import type {Track} from '../../get-tracks';
import type {ParserState} from '../../state/parser-state';
import {getCodecStringFromSpsAndPps} from '../avc/codec-string';
import {
	getTrack,
	NO_CODEC_PRIVATE_SHOULD_BE_DERIVED_FROM_SPS,
} from './make-track';
import {getMainSegment, getTracksSegment} from './traversal';

export type ResolvedAndUnresolvedTracks = {
	resolved: Track[];
	missingInfo: Track[];
};

export const getTracksFromMatroska = ({
	state,
}: {
	state: ParserState;
}): ResolvedAndUnresolvedTracks => {
	const webmState = state.webm;

	const structure = state.getMatroskaStructure();
	const mainSegment = getMainSegment(structure.boxes);
	if (!mainSegment) {
		throw new Error('No main segment');
	}

	const tracksSegment = getTracksSegment(mainSegment);

	if (!tracksSegment) {
		throw new Error('No tracks segment');
	}

	const resolvedTracks: Track[] = [];
	const missingInfo: Track[] = [];

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

export const matroskaHasTracks = (state: ParserState) => {
	const structure = state.getMatroskaStructure();
	const mainSegment = getMainSegment(structure.boxes);
	if (!mainSegment) {
		return false;
	}

	return (
		getTracksSegment(mainSegment) !== null &&
		getTracksFromMatroska({
			state,
		}).missingInfo.length === 0
	);
};

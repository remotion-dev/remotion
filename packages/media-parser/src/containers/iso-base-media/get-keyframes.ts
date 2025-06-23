import {getTracksFromIsoBaseMedia} from '../../get-tracks';
import type {MediaParserKeyframe} from '../../options';
import type {ParserState} from '../../state/parser-state';
import {areSamplesComplete} from './are-samples-complete';
import {getSamplePositionsFromTrack} from './get-sample-positions-from-track';
import {
	getMoofBoxes,
	getMoovFromFromIsoStructure,
	getTfraBoxes,
	getTrakBoxByTrackId,
	getTrexBoxes,
} from './traversal';

export const getKeyframesFromIsoBaseMedia = (
	state: ParserState,
): MediaParserKeyframe[] => {
	const tracks = getTracksFromIsoBaseMedia({
		isoState: state.iso,
		m3uPlaylistContext: state.m3uPlaylistContext,
		structure: state.structure,
		mayUsePrecomputed: true,
	});
	const videoTracks = tracks.filter((t) => t.type === 'video');
	const structure = state.structure.getIsoStructure();

	const moofBoxes = getMoofBoxes(structure.boxes);
	const tfraBoxes = getTfraBoxes(structure.boxes);

	const moov = getMoovFromFromIsoStructure(structure);
	if (!moov) {
		return [];
	}

	const allSamples = videoTracks.map((t): MediaParserKeyframe[] => {
		const {originalTimescale: ts} = t;
		const trakBox = getTrakBoxByTrackId(moov, t.trackId);
		if (!trakBox) {
			return [];
		}

		const {samplePositions, isComplete} = getSamplePositionsFromTrack({
			trakBox,
			moofBoxes,
			moofComplete: areSamplesComplete({
				moofBoxes,
				tfraBoxes,
			}),
			trexBoxes: getTrexBoxes(moov),
		});

		if (!isComplete) {
			return [];
		}

		const keyframes = samplePositions
			.filter((k) => {
				return k.isKeyframe;
			})
			.map((k): MediaParserKeyframe => {
				return {
					trackId: t.trackId,
					presentationTimeInSeconds: k.timestamp / ts,
					decodingTimeInSeconds: k.decodingTimestamp / ts,
					positionInBytes: k.offset,
					sizeInBytes: k.size,
				};
			});
		return keyframes;
	});

	return allSamples.flat();
};

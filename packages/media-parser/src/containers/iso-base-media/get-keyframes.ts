import {getTracksFromIsoBaseMedia} from '../../get-tracks';
import type {MediaParserKeyframe} from '../../options';
import type {ParserState} from '../../state/parser-state';
import {getSamplePositionsFromTrack} from './get-sample-positions-from-track';
import type {TrakBox} from './trak/trak';
import {getMoofBoxes} from './traversal';

export const getKeyframesFromIsoBaseMedia = (
	state: ParserState,
): MediaParserKeyframe[] => {
	const {videoTracks} = getTracksFromIsoBaseMedia(state);
	const structure = state.getIsoStructure();

	const moofBox = getMoofBoxes(structure.boxes);

	const allSamples = videoTracks.map((t): MediaParserKeyframe[] => {
		const {timescale: ts} = t;
		const samplePositions = getSamplePositionsFromTrack({
			trakBox: t.trakBox as TrakBox,
			moofBoxes: moofBox,
		});

		const keyframes = samplePositions
			.filter((k) => {
				return k.isKeyframe;
			})
			.map((k): MediaParserKeyframe => {
				return {
					trackId: t.trackId,
					presentationTimeInSeconds: k.cts / ts,
					decodingTimeInSeconds: k.dts / ts,
					positionInBytes: k.offset,
					sizeInBytes: k.size,
				};
			});
		return keyframes;
	});

	return allSamples.flat();
};

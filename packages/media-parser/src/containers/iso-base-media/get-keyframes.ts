import {getTracksFromIsoBaseMedia} from '../../get-tracks';
import type {MediaParserKeyframe} from '../../options';
import type {IsoBaseMediaStructure} from '../../parse-result';
import {getSamplePositionsFromTrack} from './get-sample-positions-from-track';
import type {TrakBox} from './trak/trak';
import {getMoofBox} from './traversal';

export const getKeyframesFromIsoBaseMedia = (
	structure: IsoBaseMediaStructure,
): MediaParserKeyframe[] => {
	const {videoTracks} = getTracksFromIsoBaseMedia(structure.boxes);
	const moofBox = getMoofBox(structure.boxes);

	const allSamples = videoTracks.map((t): MediaParserKeyframe[] => {
		const {timescale: ts} = t;
		const samplePositions = getSamplePositionsFromTrack(
			t.trakBox as TrakBox,
			moofBox,
		);

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

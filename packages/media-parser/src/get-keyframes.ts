import {getSamplePositionsFromTrack} from './boxes/iso-base-media/get-sample-positions-from-track';
import type {TrakBox} from './boxes/iso-base-media/trak/trak';
import {getMoofBox} from './boxes/iso-base-media/traversal';
import {getTracksFromIsoBaseMedia} from './get-tracks';
import type {MediaParserKeyframe} from './options';
import type {IsoBaseMediaStructure} from './parse-result';

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
					presentationTimeInTimescale: k.cts,
					decodingTimeInSeconds: k.dts / ts,
					positionInBytes: k.offset,
					sizeInBytes: k.size,
				};
			});
		return keyframes;
	});

	return allSamples.flat();
};

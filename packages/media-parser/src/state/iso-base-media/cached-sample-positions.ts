import {getSamplePositionsFromTrack} from '../../boxes/iso-base-media/get-sample-positions-from-track';
import type {TrakBox} from '../../boxes/iso-base-media/trak/trak';
import {getMoofBox} from '../../boxes/iso-base-media/traversal';
import {getTracks} from '../../get-tracks';
import type {IsoBaseMediaStructure} from '../../parse-result';
import type {ParserState} from '../parser-state';

const getSamples = (state: ParserState) => {
	const tracks = getTracks(state);
	const allTracks = [
		...tracks.videoTracks,
		...tracks.audioTracks,
		...tracks.otherTracks,
	];

	const flatSamples = allTracks
		.map((track) => {
			const samplePositions = getSamplePositionsFromTrack(
				track.trakBox as TrakBox,
				getMoofBox(
					(state.structure.getStructure() as IsoBaseMediaStructure).boxes,
				),
			);
			if (!samplePositions) {
				throw new Error('No sample positions');
			}

			return samplePositions.map((samplePosition) => {
				return {
					track,
					samplePosition,
				};
			});
		})
		.flat(1);
	return flatSamples;
};

export const cachedSamplePositionsState = () => {
	let cached: ReturnType<typeof getSamples> | null = null;

	return {
		getSamples: (state: ParserState) => {
			if (!cached) {
				cached = getSamples(state);
			}

			return cached;
		},
	};
};

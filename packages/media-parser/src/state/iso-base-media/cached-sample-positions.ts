import {getSamplePositionsFromTrack} from '../../containers/iso-base-media/get-sample-positions-from-track';
import type {TrakBox} from '../../containers/iso-base-media/trak/trak';
import {getMoofBox} from '../../containers/iso-base-media/traversal';
import type {SamplePosition} from '../../get-sample-positions';
import type {AudioTrack, OtherTrack, VideoTrack} from '../../get-tracks';
import {getTracks} from '../../get-tracks';
import type {IsoBaseMediaStructure} from '../../parse-result';
import type {ParserState} from '../parser-state';

export type FlatSample = {
	track: VideoTrack | AudioTrack | OtherTrack;
	samplePosition: SamplePosition;
};

export const calculateFlatSamples = (state: ParserState) => {
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
	let cached: FlatSample[] | null = null;

	return {
		getSamples: () => {
			return cached;
		},
		setSamples: (samples: FlatSample[]) => {
			cached = samples;
		},
	};
};

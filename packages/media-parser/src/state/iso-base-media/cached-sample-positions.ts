import {getSamplePositionsFromTrack} from '../../containers/iso-base-media/get-sample-positions-from-track';
import type {TrakBox} from '../../containers/iso-base-media/trak/trak';
import {
	getMoofBoxes,
	getTfraBoxes,
} from '../../containers/iso-base-media/traversal';
import type {SamplePosition} from '../../get-sample-positions';
import type {AudioTrack, OtherTrack, VideoTrack} from '../../get-tracks';
import {getTracks} from '../../get-tracks';
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
			const samplePositions = getSamplePositionsFromTrack({
				trakBox: track.trakBox as TrakBox,
				moofBoxes: getMoofBoxes(state.getIsoStructure().boxes),
				tfraBoxes: getTfraBoxes(state.getIsoStructure()),
				needsToBeComplete: false,
			});
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
	const cachedForMdatStart: Record<string, FlatSample[]> = {};

	return {
		getSamples: (mdatStart: number) => {
			if (cachedForMdatStart[mdatStart]) {
				return cachedForMdatStart[mdatStart];
			}

			return null;
		},
		setSamples: (mdatStart: number, samples: FlatSample[]) => {
			cachedForMdatStart[mdatStart] = samples;
		},
	};
};

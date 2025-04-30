import {areSamplesComplete} from '../../containers/iso-base-media/are-samples-complete';
import {getSamplePositionsFromTrack} from '../../containers/iso-base-media/get-sample-positions-from-track';
import type {JumpMark} from '../../containers/iso-base-media/mdat/calculate-jump-marks';
import type {TrakBox} from '../../containers/iso-base-media/trak/trak';
import {
	getMoofBoxes,
	getTfraBoxes,
} from '../../containers/iso-base-media/traversal';
import type {SamplePosition} from '../../get-sample-positions';
import type {AudioTrack, OtherTrack, VideoTrack} from '../../get-tracks';
import {getTracks} from '../../get-tracks';
import type {ParserState} from '../parser-state';
import {deduplicateTfraBoxesByOffset} from './precomputed-tfra';

export type FlatSample = {
	track: VideoTrack | AudioTrack | OtherTrack;
	samplePosition: SamplePosition;
};

export type MinimalFlatSampleForTesting = {
	track: {
		trackId: number;
		timescale: number;
		type: 'audio' | 'video' | 'other';
	};
	samplePosition: {
		dts: number;
		offset: number;
	};
};

export const calculateFlatSamples = ({
	state,
	mediaSectionStart,
}: {
	state: ParserState;
	mediaSectionStart: number;
}) => {
	const tracks = getTracks(state, true);
	const allTracks = [
		...tracks.videoTracks,
		...tracks.audioTracks,
		...tracks.otherTracks,
	];

	const moofBoxes = getMoofBoxes(state.structure.getIsoStructure().boxes);
	const tfraBoxes = deduplicateTfraBoxesByOffset([
		...state.iso.tfra.getTfraBoxes(),
		...getTfraBoxes(state.structure.getIsoStructure().boxes),
	]);
	const moofComplete = areSamplesComplete({moofBoxes, tfraBoxes});
	const relevantMoofBox = moofBoxes.find(
		(moofBox) => moofBox.offset + moofBox.size + 8 === mediaSectionStart,
	);

	if (!relevantMoofBox) {
		throw new Error('No relevant moof box found');
	}

	const flatSamples = allTracks.map((track) => {
		const {samplePositions} = getSamplePositionsFromTrack({
			trakBox: track.trakBox as TrakBox,
			moofBoxes: [relevantMoofBox],
			moofComplete,
		});

		return samplePositions.map((samplePosition) => {
			return {
				track,
				samplePosition,
			};
		});
	});
	return flatSamples;
};

export const cachedSamplePositionsState = () => {
	const cachedForMdatStart: Record<string, FlatSample[]> = {};
	const jumpMarksForMdatStart: Record<string, JumpMark[]> = {};

	return {
		getSamples: (mdatStart: number) => {
			return cachedForMdatStart[mdatStart] ?? null;
		},
		setSamples: (mdatStart: number, samples: FlatSample[]) => {
			cachedForMdatStart[mdatStart] = samples;
		},
		setJumpMarks: (mdatStart: number, marks: JumpMark[]) => {
			jumpMarksForMdatStart[mdatStart] = marks;
		},
		getJumpMarks: (mdatStart: number) => {
			return jumpMarksForMdatStart[mdatStart];
		},
	};
};

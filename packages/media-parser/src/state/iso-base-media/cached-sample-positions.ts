import {areSamplesComplete} from '../../containers/iso-base-media/are-samples-complete';
import {getSamplePositionsFromTrack} from '../../containers/iso-base-media/get-sample-positions-from-track';
import type {JumpMark} from '../../containers/iso-base-media/mdat/calculate-jump-marks';
import {
	getMoofBoxes,
	getMoovBoxFromState,
	getTfraBoxes,
	getTrakBoxByTrackId,
} from '../../containers/iso-base-media/traversal';
import type {SamplePosition} from '../../get-sample-positions';
import type {
	MediaParserAudioTrack,
	MediaParserOtherTrack,
	MediaParserVideoTrack,
} from '../../get-tracks';
import {getTracks} from '../../get-tracks';
import type {ParserState} from '../parser-state';
import {deduplicateTfraBoxesByOffset} from './precomputed-tfra';

export type FlatSample = {
	track: MediaParserVideoTrack | MediaParserAudioTrack | MediaParserOtherTrack;
	samplePosition: SamplePosition;
};

export type MinimalFlatSampleForTesting = {
	track: {
		trackId: number;
		originalTimescale: number;
		type: 'audio' | 'video' | 'other';
	};
	samplePosition: {
		decodingTimestamp: number;
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

	const moofBoxes = getMoofBoxes(state.structure.getIsoStructure().boxes);
	const tfraBoxes = deduplicateTfraBoxesByOffset([
		...state.iso.tfra.getTfraBoxes(),
		...getTfraBoxes(state.structure.getIsoStructure().boxes),
	]);
	const moofComplete = areSamplesComplete({moofBoxes, tfraBoxes});
	const relevantMoofBox = moofBoxes.find(
		(moofBox) => moofBox.offset + moofBox.size + 8 === mediaSectionStart,
	);

	if (moofBoxes.length > 0 && !relevantMoofBox) {
		throw new Error('No relevant moof box found');
	}

	const moov = getMoovBoxFromState({
		structureState: state.structure,
		isoState: state.iso,
		mp4HeaderSegment: state.m3uPlaylistContext?.mp4HeaderSegment ?? null,
		mayUsePrecomputed: true,
	});
	if (!moov) {
		throw new Error('No moov box found');
	}

	const flatSamples = tracks.map((track) => {
		const trakBox = getTrakBoxByTrackId(moov, track.trackId);

		if (!trakBox) {
			throw new Error('No trak box found');
		}

		const {samplePositions} = getSamplePositionsFromTrack({
			trakBox,
			moofBoxes: relevantMoofBox ? [relevantMoofBox] : [],
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

import {areSamplesComplete} from '../../containers/iso-base-media/are-samples-complete';
import {getSamplePositionsFromTrack} from '../../containers/iso-base-media/get-sample-positions-from-track';
import {
	getMoofBoxes,
	getMoovBoxFromState,
	getTfraBoxes,
	getTrakBoxByTrackId,
	getTrexBoxes,
} from '../../containers/iso-base-media/traversal';
import type {SamplePosition} from '../../get-sample-positions';
import {getTracks} from '../../get-tracks';
import type {ParserState} from '../parser-state';
import {deduplicateTfraBoxesByOffset} from './precomputed-tfra';

type TrackIdAndSamplePositions = {
	trackId: number;
	samplePositions: SamplePosition[];
};

export const calculateSamplePositions = ({
	state,
	mediaSectionStart,
	trackIds,
}: {
	state: ParserState;
	mediaSectionStart: number;
	trackIds: number[];
}): TrackIdAndSamplePositions[] => {
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

	const trackIdAndSamplePositions: TrackIdAndSamplePositions[] = [];

	for (const track of tracks) {
		const trakBox = getTrakBoxByTrackId(moov, track.trackId);
		if (!trackIds.includes(track.trackId)) {
			continue;
		}

		if (!trakBox) {
			throw new Error('No trak box found');
		}

		const {samplePositions} = getSamplePositionsFromTrack({
			trakBox,
			moofBoxes: relevantMoofBox ? [relevantMoofBox] : [],
			moofComplete,
			trexBoxes: getTrexBoxes(moov),
		});

		trackIdAndSamplePositions.push({
			trackId: track.trackId,
			samplePositions,
		});
	}

	return trackIdAndSamplePositions;
};

export const cachedSamplePositionsState = () => {
	// offset -> sample positions
	const samplePositionsForMdatStart: Record<
		number,
		TrackIdAndSamplePositions[]
	> = {};

	const currentSampleIndex: Record<number, Record<number, number>> = {};

	return {
		getSamples: (mdatStart: number): TrackIdAndSamplePositions[] | null => {
			return samplePositionsForMdatStart[mdatStart] ?? null;
		},
		setSamples: (mdatStart: number, samples: TrackIdAndSamplePositions[]) => {
			samplePositionsForMdatStart[mdatStart] = samples;
		},
		setCurrentSampleIndex: (
			mdatStart: number,
			trackId: number,
			index: number,
		) => {
			if (!currentSampleIndex[mdatStart]) {
				currentSampleIndex[mdatStart] = {};
			}

			if (!currentSampleIndex[mdatStart][trackId]) {
				currentSampleIndex[mdatStart][trackId] = 0;
			}

			currentSampleIndex[mdatStart][trackId] = index;
		},
		getCurrentSampleIndices: (mdatStart: number) => {
			return currentSampleIndex[mdatStart] ?? {};
		},
	};
};

type Lowest = {
	samplePosition: SamplePosition;
	trackId: number;
	index: number;
};

export const getSampleWithLowestDts = (
	samplePositions: TrackIdAndSamplePositions[],
	currentSampleIndexMap: Record<number, number>,
): Lowest | undefined => {
	let lowestDts: Lowest | undefined;

	for (const track of samplePositions) {
		const currentSampleIndex = currentSampleIndexMap[track.trackId] ?? 0;
		const currentSample = track.samplePositions[currentSampleIndex] as
			| SamplePosition
			| undefined;

		if (
			currentSample &&
			(!lowestDts ||
				currentSample.decodingTimestamp <
					lowestDts.samplePosition.decodingTimestamp)
		) {
			lowestDts = {
				samplePosition: currentSample,
				trackId: track.trackId,
				index: currentSampleIndex,
			};
		}
	}

	return lowestDts;
};

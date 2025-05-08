import type {SamplePosition} from '../../get-sample-positions';
import type {
	MediaParserAudioTrack,
	MediaParserOtherTrack,
	MediaParserVideoTrack,
} from '../../get-tracks';
import type {IsoBaseMediaStructure} from '../../parse-result';
import type {StructureState} from '../../state/structure';
import {areSamplesComplete} from './are-samples-complete';
import {getSamplePositionsFromTrack} from './get-sample-positions-from-track';
import type {TrakBox} from './trak/trak';
import {getMoofBoxes, getTfraBoxes} from './traversal';

export const findAnyTrackWithSamplePositions = (
	allTracks: (
		| MediaParserVideoTrack
		| MediaParserAudioTrack
		| MediaParserOtherTrack
	)[],
	struc: IsoBaseMediaStructure,
) => {
	for (const track of allTracks) {
		if (track.type === 'video' || track.type === 'audio') {
			const {samplePositions} = getSamplePositionsFromTrack({
				trakBox: track.trakBox as TrakBox,
				moofBoxes: getMoofBoxes(struc.boxes),
				moofComplete: areSamplesComplete({
					moofBoxes: getMoofBoxes(struc.boxes),
					tfraBoxes: getTfraBoxes(struc.boxes),
				}),
			});

			if (samplePositions.length === 0) {
				continue;
			}

			return {track, samplePositions};
		}
	}

	return null;
};

type TrackWithSamplePositions = {
	track: MediaParserVideoTrack | MediaParserAudioTrack;
	samplePositions: SamplePosition[];
};

export const findTrackToSeek = (
	allTracks: (
		| MediaParserVideoTrack
		| MediaParserAudioTrack
		| MediaParserOtherTrack
	)[],
	structure: StructureState,
): TrackWithSamplePositions | null => {
	const firstVideoTrack = allTracks.find((t) => t.type === 'video');

	const struc = structure.getIsoStructure();
	if (!firstVideoTrack) {
		return findAnyTrackWithSamplePositions(allTracks, struc);
	}

	const {samplePositions} = getSamplePositionsFromTrack({
		trakBox: firstVideoTrack.trakBox as TrakBox,
		moofBoxes: getMoofBoxes(struc.boxes),
		moofComplete: areSamplesComplete({
			moofBoxes: getMoofBoxes(struc.boxes),
			tfraBoxes: getTfraBoxes(struc.boxes),
		}),
	});

	if (samplePositions.length === 0) {
		return findAnyTrackWithSamplePositions(allTracks, struc);
	}

	return {track: firstVideoTrack, samplePositions};
};

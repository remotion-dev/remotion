import type {AudioTrack, OtherTrack, VideoTrack} from '../../get-tracks';
import type {IsoBaseMediaStructure} from '../../parse-result';
import type {StructureState} from '../../state/structure';
import {getSamplePositionsFromTrack} from './get-sample-positions-from-track';
import type {GroupOfSamplePositions} from './sample-positions';
import {hasNoSamplePositionsGroup} from './sample-positions';
import type {TrakBox} from './trak/trak';
import {getMoofBoxes, getTfraBoxes} from './traversal';

export const findAnyTrackWithSamplePositions = (
	allTracks: (VideoTrack | AudioTrack | OtherTrack)[],
	struc: IsoBaseMediaStructure,
) => {
	for (const track of allTracks) {
		if (track.type === 'video' || track.type === 'audio') {
			const {samplePositions} = getSamplePositionsFromTrack({
				trakBox: track.trakBox as TrakBox,
				moofBoxes: getMoofBoxes(struc.boxes),
				tfraBoxes: getTfraBoxes(struc),
			});

			if (hasNoSamplePositionsGroup(samplePositions)) {
				continue;
			}

			return {track, samplePositions};
		}
	}

	return null;
};

type TrackWithSamplePositions = {
	track: VideoTrack | AudioTrack;
	samplePositions: GroupOfSamplePositions[];
};

export const findTrackToSeek = (
	allTracks: (VideoTrack | AudioTrack | OtherTrack)[],
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
		tfraBoxes: getTfraBoxes(struc),
	});

	if (hasNoSamplePositionsGroup(samplePositions)) {
		return findAnyTrackWithSamplePositions(allTracks, struc);
	}

	return {track: firstVideoTrack, samplePositions};
};

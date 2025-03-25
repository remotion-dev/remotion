import {getTracksFromMoovBox} from '../../get-tracks';
import type {IsoBaseMediaSeekingInfo} from '../../seeking-info';
import {collectSamplePositionsFromMoofBoxes} from './collect-sample-positions-from-moof-boxes';
import {findKeyframeBeforeTime} from './find-keyframe-before-time';
import {getSamplePositionsFromTrack} from './get-sample-positions-from-track';
import type {TrakBox} from './trak/trak';
import {getTkhdBox} from './traversal';

export const getSeekingByteFromIsoBaseMedia = (
	info: IsoBaseMediaSeekingInfo,
	time: number,
) => {
	const tracks = getTracksFromMoovBox(info.moovBox);
	const allTracks = [
		...tracks.videoTracks,
		...tracks.audioTracks,
		...tracks.otherTracks,
	];

	const firstVideoTrack = allTracks.find((t) => t.type === 'video');

	if (!firstVideoTrack) {
		throw new Error('No video track found');
	}

	const {timescale} = firstVideoTrack;

	if (info.moofBoxes.length > 0) {
		const tkhdBox = getTkhdBox(firstVideoTrack.trakBox as TrakBox);
		if (!tkhdBox) {
			throw new Error('Expected tkhd box in trak box');
		}

		const {isComplete: isComplete_, samplePositions: samplePositions_} =
			collectSamplePositionsFromMoofBoxes({
				moofBoxes: info.moofBoxes,
				tfraBoxes: info.tfraBoxes,
				tkhdBox,
			});
		if (!isComplete_) {
			throw new Error('Incomplete sample positions');
		}

		return findKeyframeBeforeTime({
			samplePositions: samplePositions_,
			time,
			timescale,
		});
	}

	const {samplePositions, isComplete} = getSamplePositionsFromTrack({
		trakBox: firstVideoTrack.trakBox as TrakBox,
		moofBoxes: info.moofBoxes,
		tfraBoxes: info.tfraBoxes,
	});

	if (!isComplete) {
		throw new Error('Incomplete sample positions');
	}

	return findKeyframeBeforeTime({samplePositions, time, timescale});
};

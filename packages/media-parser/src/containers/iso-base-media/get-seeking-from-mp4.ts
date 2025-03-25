import {getTracksFromMoovBox} from '../../get-tracks';
import type {LogLevel} from '../../log';
import {Log} from '../../log';
import type {IsoBaseMediaSeekingInfo} from '../../seeking-info';
import {
	getCurrentVideoSection,
	isByteInVideoSection,
} from '../../state/video-section';
import type {SeekResolution} from '../../work-on-seek-request';
import {collectSamplePositionsFromMoofBoxes} from './collect-sample-positions-from-moof-boxes';
import {findKeyframeBeforeTime} from './find-keyframe-before-time';
import {getSamplePositionBounds} from './get-sample-position-bounds';
import {getSamplePositionsFromTrack} from './get-sample-positions-from-track';
import type {TrakBox} from './trak/trak';
import {getTkhdBox} from './traversal';

export const getSeekingByteFromIsoBaseMedia = ({
	info,
	time,
	logLevel,
	currentPosition,
}: {
	info: IsoBaseMediaSeekingInfo;
	time: number;
	logLevel: LogLevel;
	currentPosition: number;
}): SeekResolution => {
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

		const {samplePositions: samplePositionsArray} =
			collectSamplePositionsFromMoofBoxes({
				moofBoxes: info.moofBoxes,
				tfraBoxes: info.tfraBoxes,
				tkhdBox,
			});

		Log.trace(
			logLevel,
			'Fragmented MP4 - Checking if we have seeking info for this time range',
		);
		for (const positions of samplePositionsArray) {
			const {min, max} = getSamplePositionBounds(positions, timescale);
			if (min <= time && time <= max) {
				Log.trace(
					logLevel,
					`Fragmented MP4 - Found that we have seeking info for this time range: ${min} <= ${time} <= ${max}`,
				);
				const kf = findKeyframeBeforeTime({
					samplePositions: positions,
					time,
					timescale,
					logLevel,
					videoSections: info.videoSections,
				});
				if (kf) {
					return {
						type: 'do-seek',
						byte: kf,
					};
				}
			}
		}

		Log.trace(
			logLevel,
			'Fragmented MP4 - No seeking info found for this time range.',
		);
		if (
			isByteInVideoSection({
				position: currentPosition,
				videoSections: info.videoSections,
			}) === 'in-section'
		) {
			Log.trace(
				logLevel,
				'Fragmented MP4 - Inside the wrong video section, skipping to the end of the section',
			);
			const videoSection = getCurrentVideoSection({
				offset: currentPosition,
				videoSections: info.videoSections,
			});
			if (!videoSection) {
				throw new Error('No video section defined');
			}

			return {
				type: 'intermediary-seek',
				byte: videoSection.start + videoSection.size,
			};
		}

		return {
			type: 'valid-but-must-wait',
		};
	}

	const {samplePositions, isComplete} = getSamplePositionsFromTrack({
		trakBox: firstVideoTrack.trakBox as TrakBox,
		moofBoxes: info.moofBoxes,
		tfraBoxes: info.tfraBoxes,
	});

	if (!isComplete) {
		throw new Error('Incomplete sample positions');
	}

	const keyframe = findKeyframeBeforeTime({
		samplePositions,
		time,
		timescale,
		logLevel,
		videoSections: info.videoSections,
	});

	if (keyframe) {
		return {
			type: 'do-seek',
			byte: keyframe,
		};
	}

	return {
		type: 'invalid',
	};
};

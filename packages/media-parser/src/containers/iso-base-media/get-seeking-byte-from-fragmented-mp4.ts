import type {AudioTrack, OtherTrack, VideoTrack} from '../../get-tracks';
import type {LogLevel} from '../../log';
import {Log} from '../../log';
import type {IsoBaseMediaSeekingHints} from '../../seeking-hints';
import type {IsoBaseMediaState} from '../../state/iso-base-media/iso-state';
import {
	getCurrentMediaSection,
	isByteInMediaSection,
} from '../../state/video-section';
import type {SeekResolution} from '../../work-on-seek-request';
import {collectSamplePositionsFromMoofBoxes} from './collect-sample-positions-from-moof-boxes';
import {findKeyframeBeforeTime} from './find-keyframe-before-time';
import {getSamplePositionBounds} from './get-sample-position-bounds';
import {findBestSegmentFromTfra} from './mfra/find-best-segment-from-tfra';
import type {TrakBox} from './trak/trak';
import {getTkhdBox} from './traversal';

export const getSeekingByteFromFragmentedMp4 = async ({
	info,
	time,
	logLevel,
	currentPosition,
	isoState,
	allTracks,
	isLastChunkInPlaylist,
}: {
	info: IsoBaseMediaSeekingHints;
	time: number;
	logLevel: LogLevel;
	currentPosition: number;
	isoState: IsoBaseMediaState;
	allTracks: (VideoTrack | AudioTrack | OtherTrack)[];
	isLastChunkInPlaylist: boolean;
}): Promise<SeekResolution> => {
	const firstVideoTrack = allTracks.find((t) => t.type === 'video');

	// If there is both video and audio, seek based on video, but if not then audio is also okay
	const firstTrack =
		firstVideoTrack ?? allTracks.find((t) => t.type === 'audio');

	if (!firstTrack) {
		throw new Error('no video and no audio tracks');
	}

	const tkhdBox = getTkhdBox(firstTrack.trakBox as TrakBox);
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
		const {min, max} = getSamplePositionBounds(
			positions.samples,
			firstTrack.timescale,
		);

		if (
			min <= time &&
			(positions.isLastFragment || isLastChunkInPlaylist || time <= max)
		) {
			Log.trace(
				logLevel,
				`Fragmented MP4 - Found that we have seeking info for this time range: ${min} <= ${time} <= ${max}`,
			);

			const kf = findKeyframeBeforeTime({
				samplePositions: positions.samples,
				time,
				timescale: firstTrack.timescale,
				logLevel,
				mediaSections: info.mediaSections,
			});

			if (kf) {
				return {
					type: 'do-seek',
					byte: kf,
				};
			}
		}
	}

	const atom = await (info.mfraAlreadyLoaded
		? Promise.resolve(info.mfraAlreadyLoaded)
		: isoState.mfra.triggerLoad());

	if (atom) {
		const moofOffset = findBestSegmentFromTfra({
			mfra: atom,
			time,
			firstTrack,
			timescale: firstTrack.timescale,
		});

		if (
			moofOffset !== null &&
			!(moofOffset.start <= currentPosition && currentPosition < moofOffset.end)
		) {
			Log.verbose(
				logLevel,
				`Fragmented MP4 - Found based on mfra information that we should seek to: ${moofOffset.start} ${moofOffset.end}`,
			);

			return {
				type: 'intermediary-seek',
				byte: moofOffset.start,
			};
		}
	}

	Log.trace(
		logLevel,
		'Fragmented MP4 - No seeking info found for this time range.',
	);
	if (
		isByteInMediaSection({
			position: currentPosition,
			mediaSections: info.mediaSections,
		}) !== 'in-section'
	) {
		return {
			type: 'valid-but-must-wait',
		};
	}

	Log.trace(
		logLevel,
		'Fragmented MP4 - Inside the wrong video section, skipping to the end of the section',
	);
	const mediaSection = getCurrentMediaSection({
		offset: currentPosition,
		mediaSections: info.mediaSections,
	});
	if (!mediaSection) {
		throw new Error('No video section defined');
	}

	return {
		type: 'intermediary-seek',
		byte: mediaSection.start + mediaSection.size,
	};
};

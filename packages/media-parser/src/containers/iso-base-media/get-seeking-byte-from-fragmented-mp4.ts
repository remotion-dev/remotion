import type {MediaParserTrack} from '../../get-tracks';
import type {MediaParserLogLevel} from '../../log';
import {Log} from '../../log';
import type {IsoBaseMediaStructure} from '../../parse-result';
import type {IsoBaseMediaSeekingHints} from '../../seeking-hints';
import type {IsoBaseMediaState} from '../../state/iso-base-media/iso-state';
import type {StructureState} from '../../state/structure';
import {
	getCurrentMediaSection,
	isByteInMediaSection,
} from '../../state/video-section';
import type {SeekResolution} from '../../work-on-seek-request';
import {areSamplesComplete} from './are-samples-complete';
import {collectSamplePositionsFromMoofBoxes} from './collect-sample-positions-from-moof-boxes';
import {findKeyframeBeforeTime} from './find-keyframe-before-time';
import {getSamplePositionBounds} from './get-sample-position-bounds';
import {findBestSegmentFromTfra} from './mfra/find-best-segment-from-tfra';
import {
	getMoovBoxFromState,
	getTkhdBox,
	getTrakBoxByTrackId,
	getTrexBoxes,
} from './traversal';

export const getSeekingByteFromFragmentedMp4 = async ({
	info,
	time,
	logLevel,
	currentPosition,
	isoState,
	tracks,
	isLastChunkInPlaylist,
	structure,
	mp4HeaderSegment,
}: {
	info: IsoBaseMediaSeekingHints;
	time: number;
	logLevel: MediaParserLogLevel;
	currentPosition: number;
	isoState: IsoBaseMediaState;
	structure: StructureState;
	tracks: MediaParserTrack[];
	isLastChunkInPlaylist: boolean;
	mp4HeaderSegment: IsoBaseMediaStructure | null;
}): Promise<SeekResolution> => {
	const firstVideoTrack = tracks.find((t) => t.type === 'video');

	// If there is both video and audio, seek based on video, but if not then audio is also okay
	const firstTrack = firstVideoTrack ?? tracks.find((t) => t.type === 'audio');

	if (!firstTrack) {
		throw new Error('no video and no audio tracks');
	}

	const moov = getMoovBoxFromState({
		structureState: structure,
		isoState,
		mp4HeaderSegment,
		mayUsePrecomputed: true,
	});
	if (!moov) {
		throw new Error('No moov atom found');
	}

	const trakBox = getTrakBoxByTrackId(moov, firstTrack.trackId);

	if (!trakBox) {
		throw new Error('No trak box found');
	}

	const tkhdBox = getTkhdBox(trakBox);
	if (!tkhdBox) {
		throw new Error('Expected tkhd box in trak box');
	}

	const isComplete = areSamplesComplete({
		moofBoxes: info.moofBoxes,
		tfraBoxes: info.tfraBoxes,
	});

	const {samplePositions: samplePositionsArray} =
		collectSamplePositionsFromMoofBoxes({
			moofBoxes: info.moofBoxes,
			tkhdBox,
			isComplete,
			trexBoxes: getTrexBoxes(moov),
		});

	Log.trace(
		logLevel,
		'Fragmented MP4 - Checking if we have seeking info for this time range',
	);

	for (const positions of samplePositionsArray) {
		const {min, max} = getSamplePositionBounds(
			positions.samples,
			firstTrack.originalTimescale,
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
				timescale: firstTrack.originalTimescale,
				logLevel,
				mediaSections: info.mediaSections,
				startInSeconds: firstTrack.startInSeconds,
			});

			if (kf) {
				return {
					type: 'do-seek',
					byte: kf.offset,
					timeInSeconds:
						Math.min(kf.decodingTimestamp, kf.timestamp) /
						firstTrack.originalTimescale,
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
			timescale: firstTrack.originalTimescale,
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

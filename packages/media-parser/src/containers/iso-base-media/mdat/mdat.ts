import {convertAudioOrVideoSampleToWebCodecsTimestamps} from '../../../convert-audio-or-video-sample';
import {getHasTracks} from '../../../get-tracks';
import {Log} from '../../../log';
import type {FetchMoreData, Skip} from '../../../skip';
import {makeFetchMoreData, makeSkip} from '../../../skip';
import type {FlatSample} from '../../../state/iso-base-media/cached-sample-positions';
import {calculateFlatSamples} from '../../../state/iso-base-media/cached-sample-positions';
import {
	getLastMoofBox,
	getMaxFirstMoofOffset,
} from '../../../state/iso-base-media/last-moof-box';
import {
	maySkipOverSamplesInTheMiddle,
	maySkipVideoData,
} from '../../../state/may-skip-video-data';
import type {ParserState} from '../../../state/parser-state';
import {getCurrentMediaSection} from '../../../state/video-section';
import {getMoovAtom} from '../get-moov-atom';
import {calculateJumpMarks} from './calculate-jump-marks';
import {postprocessBytes} from './postprocess-bytes';

export const parseMdatSection = async (
	state: ParserState,
): Promise<Skip | FetchMoreData | null> => {
	const mediaSection = getCurrentMediaSection({
		offset: state.iterator.counter.getOffset(),
		mediaSections: state.mediaSection.getMediaSections(),
	});
	if (!mediaSection) {
		throw new Error('No video section defined');
	}

	const endOfMdat = mediaSection.size + mediaSection.start;

	// don't need mdat at all, can skip
	if (maySkipVideoData({state})) {
		const mfra = state.iso.mfra.getIfAlreadyLoaded();

		if (mfra) {
			const lastMoof = getLastMoofBox(mfra);
			if (lastMoof && lastMoof > endOfMdat) {
				Log.verbose(state.logLevel, 'Skipping to last moof', lastMoof);
				return makeSkip(lastMoof);
			}
		}

		return makeSkip(endOfMdat);
	}

	// if we only need the first and last sample, we may skip over the samples in the middle
	// this logic skips the samples in the middle for a fragmented mp4
	if (maySkipOverSamplesInTheMiddle({state})) {
		const mfra = state.iso.mfra.getIfAlreadyLoaded();
		if (mfra) {
			const lastMoof = getLastMoofBox(mfra);

			// we require that all moof boxes of both tracks have been processed, for correct duration calculation
			const firstMax = getMaxFirstMoofOffset(mfra);

			const mediaSectionsBiggerThanMoof = state.mediaSection
				.getMediaSections()
				.filter((m) => m.start > firstMax).length;

			if (mediaSectionsBiggerThanMoof > 1 && lastMoof && lastMoof > endOfMdat) {
				Log.verbose(
					state.logLevel,
					'Skipping to last moof because only first and last samples are needed',
				);
				return makeSkip(lastMoof);
			}
		}
	}

	const alreadyHasMoov = getHasTracks(state, true);

	if (!alreadyHasMoov) {
		const moov = await getMoovAtom({
			endOfMdat,
			state,
		});
		state.iso.moov.setMoovBox({
			moovBox: moov,
			precomputed: false,
		});
		state.callbacks.tracks.setIsDone(state.logLevel);

		state.structure.getIsoStructure().boxes.push(moov);
		return parseMdatSection(state);
	}

	if (!state.iso.flatSamples.getSamples(mediaSection.start)) {
		const flattedSamples = calculateFlatSamples({
			state,
			mediaSectionStart: mediaSection.start,
		});

		const calcedJumpMarks = calculateJumpMarks(flattedSamples, endOfMdat);
		state.iso.flatSamples.setJumpMarks(mediaSection.start, calcedJumpMarks);
		state.iso.flatSamples.setSamples(
			mediaSection.start,
			flattedSamples.flat(1),
		);
	}

	const flatSamples = state.iso.flatSamples.getSamples(
		mediaSection.start,
	) as FlatSample[];
	const jumpMarks = state.iso.flatSamples.getJumpMarks(mediaSection.start);
	const {iterator} = state;

	const samplesWithIndex = flatSamples.find((sample) => {
		return sample.samplePosition.offset === iterator.counter.getOffset();
	});
	if (!samplesWithIndex) {
		// There are various reasons why in mdat we find weird stuff:
		// - iphonevideo.hevc has a fake hoov atom which is not mapped
		// - corrupted.mp4 has a corrupt table
		const nextSample_ = flatSamples
			.filter((s) => s.samplePosition.offset > iterator.counter.getOffset())
			.sort((a, b) => a.samplePosition.offset - b.samplePosition.offset)[0];
		if (nextSample_) {
			iterator.discard(
				nextSample_.samplePosition.offset - iterator.counter.getOffset(),
			);
			return null;
		}

		// guess we reached the end!
		// iphonevideo.mov has extra padding here, so let's make sure to jump ahead

		Log.verbose(
			state.logLevel,
			'Could not find sample at offset',
			iterator.counter.getOffset(),
			'skipping to end of mdat',
		);

		return makeSkip(endOfMdat);
	}

	// Corrupt file: Sample is beyond the end of the file. Don't process it.
	if (
		samplesWithIndex.samplePosition.offset +
			samplesWithIndex.samplePosition.size >
		state.contentLength
	) {
		Log.verbose(
			state.logLevel,
			"Sample is beyond the end of the file. Don't process it.",
			samplesWithIndex.samplePosition.offset +
				samplesWithIndex.samplePosition.size,
			endOfMdat,
		);

		return makeSkip(endOfMdat);
	}

	// Need to fetch more data
	if (iterator.bytesRemaining() < samplesWithIndex.samplePosition.size) {
		return makeFetchMoreData(
			samplesWithIndex.samplePosition.size - iterator.bytesRemaining(),
		);
	}

	const {cts, dts, duration, isKeyframe, offset, bigEndian, chunkSize} =
		samplesWithIndex.samplePosition;
	const bytes = postprocessBytes({
		bytes: iterator.getSlice(samplesWithIndex.samplePosition.size),
		bigEndian,
		chunkSize,
	});

	if (samplesWithIndex.track.type === 'audio') {
		const audioSample = convertAudioOrVideoSampleToWebCodecsTimestamps({
			sample: {
				data: bytes,
				timestamp: cts,
				duration,
				cts,
				dts,
				trackId: samplesWithIndex.track.trackId,
				type: isKeyframe ? 'key' : 'delta',
				offset,
				timescale: samplesWithIndex.track.timescale,
			},
			timescale: samplesWithIndex.track.timescale,
		});

		await state.callbacks.onAudioSample(
			samplesWithIndex.track.trackId,
			audioSample,
		);
	}

	if (samplesWithIndex.track.type === 'video') {
		// https://remotion-assets.s3.eu-central-1.amazonaws.com/example-videos/sei_checkpoint.mp4
		// Position in file 0x0001aba615
		// https://github.com/remotion-dev/remotion/issues/4680
		// In Chrome, we may not treat recovery points as keyframes
		// otherwise "a keyframe is required after flushing"

		const nalUnitType = bytes[4] & 0b00011111;
		let isRecoveryPoint = false;
		// SEI (Supplemental enhancement information)
		if (nalUnitType === 6) {
			const seiType = bytes[5];
			isRecoveryPoint = seiType === 6;
		}

		const videoSample = convertAudioOrVideoSampleToWebCodecsTimestamps({
			sample: {
				data: bytes,
				timestamp: cts,
				duration,
				cts,
				dts,
				trackId: samplesWithIndex.track.trackId,
				type: isKeyframe && !isRecoveryPoint ? 'key' : 'delta',
				offset,
				timescale: samplesWithIndex.track.timescale,
			},
			timescale: samplesWithIndex.track.timescale,
		});

		await state.callbacks.onVideoSample(
			samplesWithIndex.track.trackId,
			videoSample,
		);
	}

	const jump = jumpMarks.find((j) => j.afterSampleWithOffset === offset);
	if (jump) {
		Log.verbose(
			state.logLevel,
			'Found jump mark',
			jump.jumpToOffset,
			'skipping to jump mark',
		);
		return makeSkip(jump.jumpToOffset);
	}

	return null;
};

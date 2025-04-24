import {convertAudioOrVideoSampleToWebCodecsTimestamps} from '../../../convert-audio-or-video-sample';
import {getHasTracks} from '../../../get-tracks';
import type {Skip} from '../../../skip';
import {makeSkip} from '../../../skip';
import type {FlatSample} from '../../../state/iso-base-media/cached-sample-positions';
import {calculateFlatSamples} from '../../../state/iso-base-media/cached-sample-positions';
import {maySkipVideoData} from '../../../state/may-skip-video-data';
import type {ParserState} from '../../../state/parser-state';
import {getCurrentMediaSection} from '../../../state/video-section';
import {getMoovAtom} from '../get-moov-atom';
import {calculateJumpMarks} from './calculate-jump-marks';
import {postprocessBytes} from './postprocess-bytes';

export const parseMdatSection = async (
	state: ParserState,
): Promise<Skip | null> => {
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
		return makeSkip(endOfMdat);
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
		const flattedSamples = calculateFlatSamples(state);

		calculateJumpMarks(flattedSamples);
		state.iso.flatSamples.setSamples(
			mediaSection.start,
			flattedSamples.flat(1),
		);
	}

	const flatSamples = state.iso.flatSamples.getSamples(
		mediaSection.start,
	) as FlatSample[];
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
		return makeSkip(endOfMdat);
	}

	if (iterator.bytesRemaining() < samplesWithIndex.samplePosition.size) {
		return null;
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

	return null;
};

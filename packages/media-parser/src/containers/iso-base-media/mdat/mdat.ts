import {convertAudioOrVideoSampleToWebCodecsTimestamps} from '../../../convert-audio-or-video-sample';
import type {MediaParserTrack} from '../../../get-tracks';
import {getHasTracks, getTracksFromMoovBox} from '../../../get-tracks';
import {Log} from '../../../log';
import type {FetchMoreData, Skip} from '../../../skip';
import {makeFetchMoreData, makeSkip} from '../../../skip';
import {
	calculateSamplePositions,
	getSampleWithLowestDts,
} from '../../../state/iso-base-media/cached-sample-positions';
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
import {WEBCODECS_TIMESCALE} from '../../../webcodecs-timescale';
import {getMoovAtom} from '../get-moov-atom';
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
		const tracksFromMoov = getTracksFromMoovBox(moov);
		state.iso.moov.setMoovBox({
			moovBox: moov,
			precomputed: false,
		});
		const existingTracks = state.callbacks.tracks.getTracks();
		for (const trackFromMoov of tracksFromMoov) {
			if (existingTracks.find((t) => t.trackId === trackFromMoov.trackId)) {
				continue;
			}

			if (trackFromMoov.type === 'other') {
				continue;
			}

			state.callbacks.tracks.addTrack(trackFromMoov);
		}

		state.callbacks.tracks.setIsDone(state.logLevel);
		state.structure.getIsoStructure().boxes.push(moov);

		return parseMdatSection(state);
	}

	const tracks = state.callbacks.tracks.getTracks();

	if (!state.iso.flatSamples.getSamples(mediaSection.start)) {
		const samplePosition = calculateSamplePositions({
			state,
			mediaSectionStart: mediaSection.start,
			trackIds: tracks.map((t) => t.trackId),
		});

		state.iso.flatSamples.setSamples(mediaSection.start, samplePosition);
	}

	const samplePositions = state.iso.flatSamples.getSamples(mediaSection.start)!;
	const sampleIndices = state.iso.flatSamples.getCurrentSampleIndices(
		mediaSection.start,
	);
	const nextSampleArray = getSampleWithLowestDts(
		samplePositions,
		sampleIndices,
	);

	if (nextSampleArray.length === 0) {
		Log.verbose(state.logLevel, 'Iterated over all samples.', endOfMdat);
		return makeSkip(endOfMdat);
	}

	const exactMatch = nextSampleArray.find(
		(s) => s.samplePosition.offset === state.iterator.counter.getOffset(),
	);
	const nextSample =
		exactMatch ??
		nextSampleArray.sort(
			(a, b) => a.samplePosition.offset - b.samplePosition.offset,
		)[0];

	if (nextSample.samplePosition.offset !== state.iterator.counter.getOffset()) {
		return makeSkip(nextSample.samplePosition.offset);
	}

	// Corrupt file: Sample is beyond the end of the file. Don't process it.
	if (
		nextSample.samplePosition.offset + nextSample.samplePosition.size >
		state.contentLength
	) {
		Log.verbose(
			state.logLevel,
			"Sample is beyond the end of the file. Don't process it.",
			nextSample.samplePosition.offset + nextSample.samplePosition.size,
			endOfMdat,
		);

		return makeSkip(endOfMdat);
	}

	const {iterator} = state;

	// Need to fetch more data
	if (iterator.bytesRemaining() < nextSample.samplePosition.size) {
		return makeFetchMoreData(
			nextSample.samplePosition.size - iterator.bytesRemaining(),
		);
	}

	const {
		timestamp: rawCts,
		decodingTimestamp: rawDts,
		duration,
		isKeyframe,
		offset,
		bigEndian,
		chunkSize,
	} = nextSample.samplePosition;

	const track = tracks.find(
		(t) => t.trackId === nextSample.trackId,
	) as MediaParserTrack;

	const {
		originalTimescale,
		startInSeconds,
		trackMediaTimeOffsetInTrackTimescale,
		timescale: trackTimescale,
	} = track;

	const cts =
		rawCts +
		startInSeconds * originalTimescale -
		(trackMediaTimeOffsetInTrackTimescale / trackTimescale) *
			WEBCODECS_TIMESCALE;
	const dts =
		rawDts +
		startInSeconds * originalTimescale -
		(trackMediaTimeOffsetInTrackTimescale / trackTimescale) *
			WEBCODECS_TIMESCALE;

	const bytes = postprocessBytes({
		bytes: iterator.getSlice(nextSample.samplePosition.size),
		bigEndian,
		chunkSize,
	});

	if (track.type === 'audio') {
		const audioSample = convertAudioOrVideoSampleToWebCodecsTimestamps({
			sample: {
				data: bytes,
				timestamp: cts,
				duration,
				decodingTimestamp: dts,
				type: isKeyframe ? 'key' : 'delta',
				offset,
			},
			timescale: originalTimescale,
		});

		await state.callbacks.onAudioSample({
			audioSample,
			trackId: track.trackId,
		});
	}

	if (track.type === 'video') {
		// https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/sei_checkpoint.mp4
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
				decodingTimestamp: dts,
				type: isKeyframe && !isRecoveryPoint ? 'key' : 'delta',
				offset,
			},
			timescale: originalTimescale,
		});

		await state.callbacks.onVideoSample({
			videoSample,
			trackId: track.trackId,
		});
	}

	state.iso.flatSamples.setCurrentSampleIndex(
		mediaSection.start,
		nextSample.trackId,
		nextSample.index + 1,
	);

	return null;
};

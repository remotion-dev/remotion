import type {ParserState} from '../../state/parser-state';
import type {QueuedVideoSample} from '../../state/riff/queued-frames';
import type {MediaParserAudioSample} from '../../webcodec-sample-types';
import {WEBCODECS_TIMESCALE} from '../../webcodecs-timescale';
import {getKeyFrameOrDeltaFromAvcInfo} from '../avc/key';
import {parseAvc} from '../avc/parse-avc';
import {convertQueuedSampleToMediaParserSample} from './convert-queued-sample-to-mediaparser-sample';
import {getStrhForIndex} from './get-strh-for-index';

export const handleChunk = async ({
	state,
	ckId,
	ckSize,
}: {
	state: ParserState;
	ckId: string;
	ckSize: number;
}) => {
	const {iterator} = state;
	const offset = iterator.counter.getOffset() - 8;

	const videoChunk = ckId.match(/^([0-9]{2})dc$/);
	if (videoChunk) {
		const trackId = parseInt(videoChunk[1], 10);
		const strh = getStrhForIndex(state.structure.getRiffStructure(), trackId);

		const samplesPerSecond = strh.rate / strh.scale;

		const data = iterator.getSlice(ckSize);
		const infos = parseAvc(data, state.avc);
		const keyOrDelta = getKeyFrameOrDeltaFromAvcInfo(infos);
		const info = infos.find(
			(i) => i.type === 'keyframe' || i.type === 'delta-frame',
		);

		const avcProfile = infos.find((i) => i.type === 'avc-profile');
		const ppsProfile = infos.find((i) => i.type === 'avc-pps');
		if (avcProfile && ppsProfile && !state.riff.getAvcProfile()) {
			await state.riff.onProfile({pps: ppsProfile, sps: avcProfile});
			state.callbacks.tracks.setIsDone(state.logLevel);
		}

		const rawSample: QueuedVideoSample = {
			data,
			// We must also NOT pass a duration because if the the next sample is 0,
			// this sample would be longer. Chrome will pad it with silence.
			// If we'd pass a duration instead, it would shift the audio and we think that audio is not finished
			duration: 1 / samplesPerSecond,
			type: keyOrDelta === 'bidirectional' ? 'delta' : keyOrDelta,
			offset,
			avc: info,
		};

		const maxFramesInBuffer = state.avc.getMaxFramesInBuffer();
		if (maxFramesInBuffer === null) {
			throw new Error('maxFramesInBuffer is null');
		}

		if ((info?.poc ?? null) === null) {
			throw new Error('poc is null');
		}

		const keyframeOffset =
			state.riff.sampleCounter.getKeyframeAtOffset(rawSample);
		if (keyframeOffset !== null) {
			state.riff.sampleCounter.setPocAtKeyframeOffset({
				keyframeOffset,
				poc: info!.poc as number,
			});
		}

		state.riff.queuedBFrames.addFrame({
			frame: rawSample,
			trackId,
			maxFramesInBuffer,
			timescale: samplesPerSecond,
		});
		const releasedFrame = state.riff.queuedBFrames.getReleasedFrame();
		if (!releasedFrame) {
			return;
		}

		const videoSample = convertQueuedSampleToMediaParserSample({
			sample: releasedFrame.sample,
			state,
			trackId: releasedFrame.trackId,
		});

		state.riff.sampleCounter.onVideoSample({
			trackId,
			videoSample,
		});
		await state.callbacks.onVideoSample({
			videoSample,
			trackId,
		});
	}

	const audioChunk = ckId.match(/^([0-9]{2})wb$/);
	if (audioChunk) {
		const trackId = parseInt(audioChunk[1], 10);
		const strh = getStrhForIndex(state.structure.getRiffStructure(), trackId);

		const {strf} = strh;
		if (strf.type !== 'strf-box-audio') {
			throw new Error('audio');
		}

		const samplesPerSecond = (strh.rate / strh.scale) * strf.numberOfChannels;
		const nthSample = state.riff.sampleCounter.getSampleCountForTrack({
			trackId,
		});
		const timeInSec = nthSample / samplesPerSecond;
		const timestamp = Math.floor(timeInSec * WEBCODECS_TIMESCALE);

		const data = iterator.getSlice(ckSize);

		const audioSample: MediaParserAudioSample = {
			decodingTimestamp: timestamp,
			data, // We must also NOT pass a duration because if the the next sample is 0,
			// this sample would be longer. Chrome will pad it with silence.
			// If we'd pass a duration instead, it would shift the audio and we think that audio is not finished
			duration: undefined,
			timestamp,
			type: 'key',
			offset,
		};
		state.riff.sampleCounter.onAudioSample(trackId, audioSample);

		// In example.avi, we have samples with 0 data
		// Chrome fails on these

		await state.callbacks.onAudioSample({
			audioSample,
			trackId,
		});
	}
};

export const parseMovi = async ({
	state,
}: {
	state: ParserState;
}): Promise<void> => {
	const {iterator} = state;

	if (iterator.bytesRemaining() < 8) {
		return Promise.resolve();
	}

	const checkpoint = iterator.startCheckpoint();
	const ckId = iterator.getByteString(4, false);
	const ckSize = iterator.getUint32Le();

	if (iterator.bytesRemaining() < ckSize) {
		checkpoint.returnToCheckpoint();
		return Promise.resolve();
	}

	await handleChunk({state, ckId, ckSize});

	const mediaSection = state.mediaSection.getMediaSectionAssertOnlyOne();

	const maxOffset = mediaSection.start + mediaSection.size;

	// Discard added zeroes
	while (
		iterator.counter.getOffset() < maxOffset &&
		iterator.bytesRemaining() > 0
	) {
		if (iterator.getUint8() !== 0) {
			iterator.counter.decrement(1);
			break;
		}
	}
};

import {convertAudioOrVideoSampleToWebCodecsTimestamps} from '../../convert-audio-or-video-sample';
import type {ParserState} from '../../state/parser-state';
import {getKeyFrameOrDeltaFromAvcInfo} from '../avc/key';
import {parseAvc} from '../avc/parse-avc';
import type {RiffStructure, StrhBox} from './riff-box';
import {getStrhBox, getStrlBoxes} from './traversal';

const getStrhForIndex = (
	structure: RiffStructure,
	trackId: number,
): StrhBox => {
	const boxes = getStrlBoxes(structure);
	const box = boxes[trackId];
	if (!box) {
		throw new Error('Expected box');
	}

	const strh = getStrhBox(box.children);
	if (!strh) {
		throw new Error('strh');
	}

	return strh;
};

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
	const offset = iterator.counter.getOffset();

	const videoChunk = ckId.match(/^([0-9]{2})dc$/);
	if (videoChunk) {
		const trackId = parseInt(videoChunk[1], 10);
		const strh = getStrhForIndex(state.getRiffStructure(), trackId);

		const samplesPerSecond = strh.rate / strh.scale;
		const nthSample = state.callbacks.getSamplesForTrack(trackId);
		const timeInSec = nthSample / samplesPerSecond;
		const timestamp = timeInSec;

		const data = iterator.getSlice(ckSize);
		const infos = parseAvc(data);
		const keyOrDelta = getKeyFrameOrDeltaFromAvcInfo(infos);

		const avcProfile = infos.find((i) => i.type === 'avc-profile');
		const ppsProfile = infos.find((i) => i.type === 'avc-pps');
		if (avcProfile && ppsProfile && !state.riff.getAvcProfile()) {
			await state.riff.onProfile({pps: ppsProfile, sps: avcProfile});
			state.callbacks.tracks.setIsDone(state.logLevel);
		}

		// We must also NOT pass a duration because if the the next sample is 0,
		// this sample would be longer. Chrome will pad it with silence.
		// If we'd pass a duration instead, it would shift the audio and we think that audio is not finished
		await state.callbacks.onVideoSample(
			trackId,
			convertAudioOrVideoSampleToWebCodecsTimestamps(
				{
					cts: timestamp,
					dts: timestamp,
					data,
					duration: undefined,
					timestamp,
					trackId,
					type: keyOrDelta,
					offset,
					timescale: samplesPerSecond,
				},
				1,
			),
		);

		return;
	}

	const audioChunk = ckId.match(/^([0-9]{2})wb$/);
	if (audioChunk) {
		const trackId = parseInt(audioChunk[1], 10);
		const strh = getStrhForIndex(state.getRiffStructure(), trackId);

		const samplesPerSecond = strh.rate / strh.scale;
		const nthSample = state.callbacks.getSamplesForTrack(trackId);
		const timeInSec = nthSample / samplesPerSecond;
		const timestamp = timeInSec;

		const data = iterator.getSlice(ckSize);

		// In example.avi, we have samples with 0 data
		// Chrome fails on these

		// We must also NOT pass a duration because if the the next sample is 0,
		// this sample would be longer. Chrome will pad it with silence.
		// If we'd pass a duration instead, it would shift the audio and we think that audio is not finished
		await state.callbacks.onAudioSample(
			trackId,
			convertAudioOrVideoSampleToWebCodecsTimestamps(
				{
					cts: timestamp,
					dts: timestamp,
					data,
					duration: undefined,
					timestamp,
					trackId,
					type: 'key',
					offset,
					timescale: samplesPerSecond,
				},
				1,
			),
		);
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

	const videoSection = state.videoSection.getVideoSection();
	const maxOffset = videoSection.start + videoSection.size;

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

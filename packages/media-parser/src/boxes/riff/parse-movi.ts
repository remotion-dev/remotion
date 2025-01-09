import type {BufferIterator} from '../../buffer-iterator';
import {convertAudioOrVideoSampleToWebCodecsTimestamps} from '../../convert-audio-or-video-sample';
import {maySkipVideoData} from '../../may-skip-video-data/may-skip-video-data';
import type {RiffStructure} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {getKeyFrameOrDeltaFromAvcInfo} from '../avc/key';
import {parseAvc} from '../avc/parse-avc';
import type {RiffResult} from './expect-riff-box';
import type {StrhBox} from './riff-box';
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
	iterator,
	state,
	structure,
	ckId,
	ckSize,
}: {
	iterator: BufferIterator;
	state: ParserState;
	structure: RiffStructure;
	ckId: string;
	ckSize: number;
}) => {
	const offset = iterator.counter.getOffset();

	const videoChunk = ckId.match(/^([0-9]{2})dc$/);
	if (videoChunk) {
		const trackId = parseInt(videoChunk[1], 10);
		const strh = getStrhForIndex(structure, trackId);

		const samplesPerSecond = strh.rate / strh.scale;
		const nthSample = state.callbacks.getSamplesForTrack(trackId);
		const timeInSec = nthSample / samplesPerSecond;
		const timestamp = timeInSec;

		const data = iterator.getSlice(ckSize);
		const infos = parseAvc(data);
		const keyOrDelta = getKeyFrameOrDeltaFromAvcInfo(infos);

		const avcProfile = infos.find((i) => i.type === 'avc-profile');
		const ppsProfile = infos.find((i) => i.type === 'avc-pps');
		if (avcProfile && ppsProfile) {
			await state.riff.onProfile({pps: ppsProfile, sps: avcProfile});
			state.callbacks.tracks.setIsDone();
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
		const strh = getStrhForIndex(structure, trackId);

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
	iterator,
	maxOffset,
	state,
	structure,
}: {
	iterator: BufferIterator;
	maxOffset: number;
	state: ParserState;
	structure: RiffStructure;
}): Promise<RiffResult> => {
	while (iterator.counter.getOffset() < maxOffset) {
		if (iterator.bytesRemaining() < 8) {
			return {
				type: 'incomplete',
				continueParsing: () => {
					return Promise.resolve(
						parseMovi({iterator, maxOffset, state, structure}),
					);
				},
			};
		}

		const ckId = iterator.getByteString(4, false);
		const ckSize = iterator.getUint32Le();

		if (
			maySkipVideoData({
				state,
			}) &&
			state.riff.getAvcProfile()
		) {
			return {
				type: 'complete',
				box: {
					type: 'movi-box',
				},
				skipTo: maxOffset,
			};
		}

		if (iterator.bytesRemaining() < ckSize) {
			iterator.counter.decrement(8);
			return {
				type: 'incomplete',
				continueParsing: () => {
					return Promise.resolve(
						parseMovi({iterator, maxOffset, state, structure}),
					);
				},
			};
		}

		await handleChunk({iterator, state, structure, ckId, ckSize});

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
	}

	if (iterator.counter.getOffset() === maxOffset) {
		return {
			type: 'complete',
			box: {
				type: 'movi-box',
			},
			skipTo: null,
		};
	}

	if (iterator.counter.getOffset() > maxOffset) {
		throw new Error('Oops, this should not happen!');
	}

	return {
		type: 'incomplete',
		continueParsing: () => {
			return Promise.resolve(
				parseMovi({iterator, maxOffset, state, structure}),
			);
		},
	};
};

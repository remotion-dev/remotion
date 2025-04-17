import {convertAudioOrVideoSampleToWebCodecsTimestamps} from '../../convert-audio-or-video-sample';
import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {WAVE_SAMPLES_PER_SECOND} from './get-seeking-byte';
import type {WavFmt} from './types';

export const parseMediaSection = async ({
	state,
}: {
	state: ParserState;
}): Promise<ParseResult> => {
	const {iterator} = state;
	const structure = state.structure.getWavStructure();

	const videoSection = state.mediaSection.getMediaSectionAssertOnlyOne();

	const maxOffset = videoSection.start + videoSection.size;
	const maxRead = maxOffset - iterator.counter.getOffset();
	const offset = iterator.counter.getOffset();

	const fmtBox = structure.boxes.find((box) => box.type === 'wav-fmt') as
		| WavFmt
		| undefined;
	if (!fmtBox) {
		throw new Error('Expected fmt box');
	}

	const toRead = Math.min(
		maxRead,
		(fmtBox.sampleRate * fmtBox.blockAlign) / WAVE_SAMPLES_PER_SECOND,
	);

	const duration = toRead / (fmtBox.sampleRate * fmtBox.blockAlign);
	const timestamp =
		(offset - videoSection.start) / (fmtBox.sampleRate * fmtBox.blockAlign);

	const data = iterator.getSlice(toRead);

	const audioSample = convertAudioOrVideoSampleToWebCodecsTimestamps({
		sample: {
			cts: timestamp,
			dts: timestamp,
			data,
			duration,
			timestamp,
			trackId: 0,
			type: 'key',
			offset,
			timescale: 1_000_000,
		},
		timescale: 1,
	});

	await state.callbacks.onAudioSample(0, audioSample);

	return null;
};

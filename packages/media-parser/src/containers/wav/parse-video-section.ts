import {convertAudioOrVideoSampleToWebCodecsTimestamps} from '../../convert-audio-or-video-sample';
import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import type {WavFmt} from './types';

export const parseVideoSection = async ({
	state,
}: {
	state: ParserState;
}): Promise<ParseResult> => {
	const {iterator} = state;
	const structure = state.getWavStructure();

	const videoSection = state.videoSection.getVideoSection();
	const maxOffset = videoSection.start + videoSection.size;
	const maxRead = maxOffset - iterator.counter.getOffset();
	const offset = iterator.counter.getOffset();

	const fmtBox = structure.boxes.find((box) => box.type === 'wav-fmt') as
		| WavFmt
		| undefined;
	if (!fmtBox) {
		throw new Error('Expected fmt box');
	}

	const secondsToRead = 1;

	const toRead = Math.min(
		maxRead,
		fmtBox.sampleRate * fmtBox.blockAlign * secondsToRead,
	);

	const duration = toRead / (fmtBox.sampleRate * fmtBox.blockAlign);
	const timestamp =
		(offset - videoSection.start) / (fmtBox.sampleRate * fmtBox.blockAlign);

	const data = iterator.getSlice(toRead);
	await state.callbacks.onAudioSample(
		0,
		convertAudioOrVideoSampleToWebCodecsTimestamps(
			{
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
			1,
		),
	);
	return null;
};

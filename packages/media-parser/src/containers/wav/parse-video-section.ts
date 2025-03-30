import {convertAudioOrVideoSampleToWebCodecsTimestamps} from '../../convert-audio-or-video-sample';
import {emitAudioSample} from '../../emit-audio-sample';
import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {getWorkOnSeekRequestOptions} from '../../work-on-seek-request';
import {WAVE_SECONDS_PER_SAMPLE} from './get-seeking-byte';
import type {WavFmt} from './types';

export const parseVideoSection = async ({
	state,
}: {
	state: ParserState;
}): Promise<ParseResult> => {
	const {iterator} = state;
	const structure = state.structure.getWavStructure();

	const videoSection = state.videoSection.getVideoSectionAssertOnlyOne();

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
		fmtBox.sampleRate * fmtBox.blockAlign * WAVE_SECONDS_PER_SAMPLE,
	);

	const duration = toRead / (fmtBox.sampleRate * fmtBox.blockAlign);
	const timestamp =
		(offset - videoSection.start) / (fmtBox.sampleRate * fmtBox.blockAlign);

	const data = iterator.getSlice(toRead);
	await emitAudioSample({
		trackId: 0,
		audioSample: convertAudioOrVideoSampleToWebCodecsTimestamps(
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
		workOnSeekRequestOptions: getWorkOnSeekRequestOptions(state),
		callbacks: state.callbacks,
	});
	return null;
};

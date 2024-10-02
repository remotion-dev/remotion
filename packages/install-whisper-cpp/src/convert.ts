import type {Caption} from '@remotion/captions';
import type {TranscriptionJson} from './transcribe';

type ConvertInput = {
	whisperCppOutput: TranscriptionJson<true>;
};

type ConvertOutput = {
	captions: Caption[];
};

export const convert = (input: ConvertInput): ConvertOutput => {
	const {transcription} = input.whisperCppOutput;

	const captions: Caption[] = [];

	for (const item of transcription) {
		captions.push({
			text: item.text,
			startMs: item.offsets.from,
			endMs: item.offsets.to,
			timestamp: item.tokens[0].t_dtw * 10,
		});
	}

	return {captions};
};

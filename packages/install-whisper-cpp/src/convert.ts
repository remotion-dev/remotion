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
		if (item.text === '') {
			continue;
		}

		captions.push({
			text: captions.length === 0 ? item.text.trimStart() : item.text,
			startMs: item.offsets.from,
			endMs: item.offsets.to,
			timestampMs:
				item.tokens[0].t_dtw === -1 ? null : item.tokens[0].t_dtw * 10,
			confidence: item.tokens[0].p,
		});
	}

	return {captions};
};

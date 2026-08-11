import type {Caption} from '@remotion/captions';
import type {TranscriptionJson} from './transcribe';

type ToCaptionsInput = {
	whisperCppOutput: TranscriptionJson<true>;
};

type ToCaptionsOutput = {
	captions: Caption[];
};

export const toCaptions = (input: ToCaptionsInput): ToCaptionsOutput => {
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

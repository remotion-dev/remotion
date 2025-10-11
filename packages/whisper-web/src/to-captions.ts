import type {Caption} from '@remotion/captions';
import type {TranscriptionItemWithTimestamp, TranscriptionJson} from './result';

type ToCaptionsInput = {
	whisperWebOutput: TranscriptionJson | TranscriptionItemWithTimestamp[];
};

type ToCaptionsOutput = {
	captions: Caption[];
};

export const toCaptions = (input: ToCaptionsInput): ToCaptionsOutput => {
	const transcription =
		'transcription' in input.whisperWebOutput
			? input.whisperWebOutput.transcription
			: input.whisperWebOutput;

	const captions: Caption[] = [];

	for (const item of transcription) {
		if (item.text === '') {
			continue;
		}

		for (const token of item.tokens) {
			captions.push({
				text: captions.length === 0 ? token.text.trimStart() : token.text,
				startMs: token.offsets.from,
				endMs: token.offsets.to,
				timestampMs: token.t_dtw === -1 ? null : token.t_dtw * 10,
				confidence: token.p,
			});
		}
	}

	return {captions};
};

import type {Caption} from '@remotion/captions';
import type {ElevenLabsTranscript} from './elevenlabs-transcript';

export type ElevenLabsTranscriptToCaptionsInput = {
	transcript: ElevenLabsTranscript;
};

export type ElevenLabsTranscriptToCaptionsOutput = {
	captions: Caption[];
};

export const elevenLabsTranscriptToCaptions = ({
	transcript,
}: ElevenLabsTranscriptToCaptionsInput): ElevenLabsTranscriptToCaptionsOutput => {
	const captions: Caption[] = [];

	if (!transcript || !transcript.words || !Array.isArray(transcript.words)) {
		throw new Error(
			'Invalid ElevenLabs transcript. The transcript must be generated with `timestamps_granularity` set to `"word"`. See https://www.remotion.dev/docs/elevenlabs/elevenlabs-transcript-to-captions',
		);
	}

	const {words} = transcript;

	let isFirst = true;

	for (let i = 0; i < words.length; i++) {
		const entry = words[i];

		if (entry.type !== 'word') {
			continue;
		}

		const prevEntry = i > 0 ? words[i - 1] : null;
		const hasSpacing = prevEntry !== null && prevEntry.type === 'spacing';

		const startMs =
			!isFirst && hasSpacing ? prevEntry.start * 1000 : entry.start * 1000;
		const endMs = entry.end * 1000;
		const text = isFirst ? entry.text : ` ${entry.text}`;

		captions.push({
			confidence: null,
			startMs,
			endMs,
			text,
			timestampMs: (startMs + endMs) / 2,
		});

		isFirst = false;
	}

	return {captions};
};

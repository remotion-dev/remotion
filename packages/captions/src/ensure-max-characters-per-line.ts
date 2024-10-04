import type {Caption} from './caption';

const splitWords = (inputCaptions: Caption[]): Caption[] => {
	const captions: Caption[] = [];

	for (let i = 0; i < inputCaptions.length; i++) {
		const w = inputCaptions[i];
		const words = w.text.split(' ');

		for (let j = 0; j < words.length; j++) {
			const word = words[j];
			captions.push({
				text: j === 0 ? ` ${word}` : word,
				startMs: w.startMs,
				endMs: w.endMs,
				confidence: w.confidence,
				timestampMs: w.timestampMs,
			});
		}
	}

	return captions;
};

export type EnsureMaxCharactersPerLineInput = {
	captions: Caption[];
	maxCharsPerLine: number;
};

export type EnsureMaxCharactersPerLineOutput = {segments: Caption[][]};

export const ensureMaxCharactersPerLine = ({
	captions,
	maxCharsPerLine,
}: EnsureMaxCharactersPerLineInput): EnsureMaxCharactersPerLineOutput => {
	const splitted = splitWords(captions);

	const segments: Caption[][] = [];
	let currentSegment: Caption[] = [];

	for (let i = 0; i < splitted.length; i++) {
		const w = splitted[i] as Caption;
		const remainingWords = splitted.slice(i + 1);
		const filledCharactersInLine = currentSegment
			.map((s) => s.text.length)
			.reduce((a, b) => a + b, 0);

		const preventOrphanWord =
			remainingWords.length < 4 &&
			remainingWords.length > 1 &&
			filledCharactersInLine > maxCharsPerLine / 2;

		if (
			filledCharactersInLine + w.text.length > maxCharsPerLine ||
			preventOrphanWord
		) {
			segments.push(currentSegment);
			currentSegment = [];
		}

		currentSegment.push(w);
	}

	segments.push(currentSegment);
	return {segments};
};

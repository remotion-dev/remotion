import type {Caption} from './caption';

export type TikTokToken = {
	text: string;
	fromMs: number;
	toMs: number;
};

export type TikTokPage = {
	text: string;
	startMs: number;
	tokens: TikTokToken[];
};

export type CreateTikTokStyleCaptionsInput = {
	captions: Caption[];
	combineTokensWithinMilliseconds: number;
};

export type CreateTikTokStyleCaptionsOutput = {
	pages: TikTokPage[];
};

export const createTikTokStyleCaptions = ({
	captions,
	combineTokensWithinMilliseconds,
}: CreateTikTokStyleCaptionsInput): CreateTikTokStyleCaptionsOutput => {
	const tikTokStyleCaptions: TikTokPage[] = [];
	let currentText = '';
	let currentTokens: TikTokToken[] = [];
	let currentFrom = 0;
	let currentTo = 0;

	captions.forEach((item, index) => {
		const {text} = item;
		// If text starts with a space, push the currentText (if it exists) and start a new one
		if (
			text.startsWith(' ') &&
			currentTo - currentFrom > combineTokensWithinMilliseconds
		) {
			if (currentText !== '') {
				tikTokStyleCaptions.push({
					text: currentText.trimStart(),
					startMs: currentFrom,
					tokens: currentTokens,
				});
			}

			// Start a new sentence
			currentText = text.trimStart();
			currentTokens = [
				{text: currentText, fromMs: item.startMs, toMs: item.endMs},
			].filter((t) => t.text !== '');
			currentFrom = item.startMs;
			currentTo = item.endMs;
		} else {
			// Continuation or start of a new sentence without leading space
			if (currentText === '') {
				// It's the start of the document or after a sentence that started with a space
				currentFrom = item.startMs;
			}

			currentText += text;
			currentText = currentText.trimStart();
			if (text.trim() !== '') {
				currentTokens.push({
					text: currentTokens.length === 0 ? currentText.trimStart() : text,
					fromMs: item.startMs,
					toMs: item.endMs,
				});
			}

			currentTo = item.endMs;
		}

		// Ensure the last sentence is added
		if (index === captions.length - 1 && currentText !== '') {
			tikTokStyleCaptions.push({
				text: currentText,
				startMs: currentFrom,
				tokens: currentTokens,
			});
		}
	});

	return {pages: tikTokStyleCaptions};
};

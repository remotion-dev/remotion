import type {Caption} from './caption';

export type TikTokToken = {
	text: string;
	fromMs: number;
	toMs: number;
	lineBreakAfter?: boolean;
};

export type TikTokPage = {
	text: string;
	startMs: number;
	tokens: TikTokToken[];
	durationMs: number;
};

export type CreateTikTokStyleCaptionsInput = {
	captions: Caption[];
	combineTokensWithinMilliseconds: number;
	breakOnSilenceAfterMilliseconds?: number;
};

export type CreateTikTokStyleCaptionsOutput = {
	pages: TikTokPage[];
};

export const createTikTokStyleCaptions = ({
	captions,
	combineTokensWithinMilliseconds,
	breakOnSilenceAfterMilliseconds,
}: CreateTikTokStyleCaptionsInput): CreateTikTokStyleCaptionsOutput => {
	const tikTokStyleCaptions: TikTokPage[] = [];
	let currentText = '';
	let currentTokens: TikTokToken[] = [];
	let currentFrom = 0;
	let currentTo = 0;

	const add = () => {
		const text = currentText.endsWith('\n')
			? currentText.slice(0, -1)
			: currentText;
		tikTokStyleCaptions.push({
			text: text.trimStart(),
			startMs: currentFrom,
			tokens: currentTokens,
			durationMs: Infinity,
		});
		if (tikTokStyleCaptions.length > 1) {
			tikTokStyleCaptions[tikTokStyleCaptions.length - 2].durationMs =
				currentFrom -
				tikTokStyleCaptions[tikTokStyleCaptions.length - 2].startMs;
		}
	};

	captions.forEach((item, index) => {
		const {text} = item;
		const exceedsDuration =
			currentTo - currentFrom > combineTokensWithinMilliseconds;
		// A pause between the previous caption and this one
		const shouldBreakOnSilence =
			breakOnSilenceAfterMilliseconds !== undefined &&
			currentText !== '' &&
			item.startMs - currentTo >= breakOnSilenceAfterMilliseconds;

		// If text starts with a space, push the currentText (if it exists) and start a new one
		if (text.startsWith(' ') && (exceedsDuration || shouldBreakOnSilence)) {
			if (currentText !== '') {
				add();
			}

			// Start a new sentence
			currentText = text.trimStart();
			currentTokens = [
				{
					text: text.trimStart(),
					fromMs: item.startMs,
					toMs: item.endMs,
					...(item.lineBreakAfter ? {lineBreakAfter: true} : {}),
				},
			].filter((t) => t.text !== '');
			currentFrom = item.startMs;
			currentTo = item.endMs;
		} else {
			// Continuation or start of a new sentence without leading space
			if (currentText === '') {
				// It's the start of the document or after a sentence that started with a space
				currentFrom = item.startMs;
			}

			const textToAppend = text;
			currentText += textToAppend;
			currentText = currentText.trimStart();
			if (text.trim() !== '') {
				currentTokens.push({
					text:
						currentTokens.length === 0 ? currentText.trimStart() : textToAppend,
					fromMs: item.startMs,
					toMs: item.endMs,
					...(item.lineBreakAfter ? {lineBreakAfter: true} : {}),
				});
			}

			currentTo = item.endMs;
		}

		if (item.lineBreakAfter && currentText !== '') {
			add();
			currentText = '';
			currentTokens = [];
		}

		// Ensure the last sentence is added
		if (index === captions.length - 1 && currentText !== '') {
			add();

			tikTokStyleCaptions[tikTokStyleCaptions.length - 1].durationMs =
				currentTo - tikTokStyleCaptions[tikTokStyleCaptions.length - 1].startMs;
		}
	});

	const lastPage = tikTokStyleCaptions[tikTokStyleCaptions.length - 1];
	if (lastPage && lastPage.durationMs === Infinity) {
		lastPage.durationMs = currentTo - lastPage.startMs;
	}

	return {pages: tikTokStyleCaptions};
};

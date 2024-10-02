import {Caption} from './captions';

export type TikTokPage = {
	text: string;
	startInSeconds: number;
};

export function createTikTokStyleCaptions({
	transcription,
	combineTokensWithinMilliseconds,
}: {
	transcription: Caption[];
	combineTokensWithinMilliseconds: number;
}): {captions: TikTokPage[]} {
	const merged: TikTokPage[] = [];
	let currentText = '';
	let currentFrom = 0;
	let currentTo = 0;
	let currentTokenLevelTimestamp = 0;

	transcription.forEach((item, index) => {
		const {text} = item;
		// If text starts with a space, push the currentText (if it exists) and start a new one
		if (
			text.startsWith(' ') &&
			currentTo - currentFrom > combineTokensWithinMilliseconds
		) {
			if (currentText !== '') {
				merged.push({
					text: currentText,
					startInSeconds: currentTokenLevelTimestamp / 1000,
				});
			}

			// Start a new sentence
			currentText = text.trimStart();
			currentFrom = item.startMs;
			currentTo = item.endMs;
			currentTokenLevelTimestamp = item.timestamp;
		} else {
			// Continuation or start of a new sentence without leading space
			if (currentText === '') {
				// It's the start of the document or after a sentence that started with a space
				currentFrom = item.startMs;
				currentTokenLevelTimestamp = item.timestamp;
			}

			currentText += text;
			currentText = currentText.trimStart();
			currentTo = item.endMs;
		}

		// Ensure the last sentence is added
		if (index === transcription.length - 1 && currentText !== '') {
			merged.push({
				text: currentText,
				startInSeconds: currentTokenLevelTimestamp / 1000,
			});
		}
	});

	return {captions: merged};
}

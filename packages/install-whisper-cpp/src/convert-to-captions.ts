import type {TranscriptionJson} from './transcribe';

export type Caption = {
	text: string;
	startInSeconds: number;
};

export function convertToCaptions({
	transcription,
	combineTokensWithinMilliseconds,
}: {
	transcription: TranscriptionJson<true>['transcription'];
	combineTokensWithinMilliseconds: number;
}): {captions: Caption[]} {
	const merged: Caption[] = [];
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
			currentFrom = item.offsets.from;
			currentTo = item.offsets.to;
			currentTokenLevelTimestamp = item.tokens[0].offsets.from;
		} else {
			// Continuation or start of a new sentence without leading space
			if (currentText === '') {
				// It's the start of the document or after a sentence that started with a space
				currentFrom = item.offsets.from;
				currentTokenLevelTimestamp = item.tokens[0].offsets.from;
			}

			currentText += text;
			currentText = currentText.trimStart();
			currentTo = item.offsets.to;
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

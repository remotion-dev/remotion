import type {TranscriptionJson} from './transcribe';

export type ConvertToCaptionCaption = {
	text: string;
	startInSeconds: number;
};

/*
 * @description Converts the JSON transcription data into captions with start times based on the defined millisecond threshold.
 * @see [Documentation](https://remotion.dev/docs/install-whisper-cpp/convert-to-captions)
 */
export function convertToCaptions({
	transcription,
	combineTokensWithinMilliseconds,
}: {
	transcription: TranscriptionJson<true>['transcription'];
	combineTokensWithinMilliseconds: number;
}): {captions: ConvertToCaptionCaption[]} {
	const merged: ConvertToCaptionCaption[] = [];
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
					startInSeconds: currentTokenLevelTimestamp / 100,
				});
			}

			// Start a new sentence
			currentText = text.trimStart();
			currentFrom = item.offsets.from;
			currentTo = item.offsets.to;
			currentTokenLevelTimestamp = item.tokens[0].t_dtw;
		} else {
			// Continuation or start of a new sentence without leading space
			if (currentText === '') {
				// It's the start of the document or after a sentence that started with a space
				currentFrom = item.offsets.from;
				currentTokenLevelTimestamp = item.tokens[0].t_dtw;
			}

			currentText += text;
			currentText = currentText.trimStart();
			currentTo = item.offsets.to;
		}

		// Ensure the last sentence is added
		if (index === transcription.length - 1 && currentText !== '') {
			merged.push({
				text: currentText,
				startInSeconds: currentTokenLevelTimestamp / 100,
			});
		}
	});

	return {captions: merged};
}

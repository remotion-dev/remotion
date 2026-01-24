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
	preserveWhitespace = false,
}: {
	transcription: TranscriptionJson<true>['transcription'];
	combineTokensWithinMilliseconds: number;
	/**
	 * @description Whether to preserve natural whitespace and pauses in the transcription.
	 * When true, leading/trailing spaces are preserved to maintain natural speech timing.
	 * @default false
	 */
	preserveWhitespace?: boolean;
}): {captions: ConvertToCaptionCaption[]} {
	const merged: ConvertToCaptionCaption[] = [];
	let currentText = '';
	let currentStartTimestamp = 0;
	let lastEndTimestamp = 0;

	transcription.forEach((item, index) => {
		const {text} = item;

		// Safe token access - check if tokens exist and have the expected structure
		const hasValidTokens =
			item.tokens && Array.isArray(item.tokens) && item.tokens.length > 0;

		if (!hasValidTokens) {
			// If no tokens, skip this item entirely - we cannot do time-based splitting
			// without reliable timing information
			return;
		}

		const firstTokenTimestamp = item.tokens[0].t_dtw;
		const lastTokenTimestamp = item.tokens[item.tokens.length - 1].t_dtw;

		// Pure time-based gap calculation (no mixing with offsets)
		const timeGapInMs = firstTokenTimestamp - lastEndTimestamp;
		const shouldStartNewCaption =
			text.startsWith(' ') && timeGapInMs > combineTokensWithinMilliseconds;

		if (shouldStartNewCaption && currentText !== '') {
			// Push the current caption
			merged.push({
				text: currentText,
				startInSeconds: currentStartTimestamp / 100,
			});

			// Start a new caption
			currentText = preserveWhitespace ? text : text.trimStart();
			currentStartTimestamp = firstTokenTimestamp;
		} else {
			// Continue building current caption
			if (currentText === '') {
				// Starting first caption or after a break
				currentStartTimestamp = firstTokenTimestamp;
			}

			currentText += text;
			if (!preserveWhitespace) {
				currentText = currentText.trimStart();
			}
		}

		// Update last timestamp for next iteration (pure time-based)
		lastEndTimestamp = lastTokenTimestamp;

		// Ensure the last caption is added
		if (index === transcription.length - 1 && currentText !== '') {
			merged.push({
				text: currentText,
				startInSeconds: currentStartTimestamp / 100,
			});
		}
	});

	return {captions: merged};
}

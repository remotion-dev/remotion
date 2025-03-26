import type {ModelState} from './mod';

let transcriptionText: string[] = [];

export const modelState: ModelState = {
	transcriptionProgressPlayback: null,
	transcriptionChunkPlayback: null,
	resolver: null,
};

export const printHandler = (text: string) => {
	const progressMatch = text.match(/Progress:\s*(\d+)%/i);
	const chunkMatch = text.match(
		/^\[(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})\]\s*(.+)$/,
	);

	if (progressMatch && modelState.transcriptionProgressPlayback) {
		const progress = parseInt(progressMatch[1], 10);
		modelState.transcriptionProgressPlayback(progress);
	}

	if (chunkMatch) {
		const timestampStart = chunkMatch[1];
		const timestampEnd = chunkMatch[2];
		const textOnly = chunkMatch[3].trim();
		modelState.transcriptionChunkPlayback?.(
			timestampStart,
			timestampEnd,
			textOnly,
		);
		transcriptionText.push(textOnly);
	}

	if (text === 'completed') {
		modelState.resolver?.(transcriptionText.join(' '));
		modelState.transcriptionChunkPlayback = null;
		modelState.transcriptionProgressPlayback = null;
		transcriptionText = [];
	}

	console.log(text);
};

import type {ModelState} from './mod';

const transcriptionText: string[] = [];

export const modelState: ModelState = {
	transcriptionProgressPlayback: null,
	transcriptionChunkPlayback: null,
	resolver: null,
};

const RESULT_TOKEN = 'remotion_final:';
const PROGRESS_TOKEN = 'remotion_progress:';
const UPDATE_TOKEN = 'remotion_update:';

export const printHandler = (text: string) => {
	console.log({text});

	const chunkMatch = text.match(
		/^\[(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})\]\s*(.+)$/,
	);

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

	if (text.startsWith(PROGRESS_TOKEN)) {
		const value = parseInt(text.slice(PROGRESS_TOKEN.length), 10);
		modelState.transcriptionProgressPlayback?.(value);
	}

	if (text.startsWith(RESULT_TOKEN)) {
		const json = JSON.parse(text.slice(RESULT_TOKEN.length));

		modelState.resolver?.(json);
	}

	if (text.startsWith(UPDATE_TOKEN)) {
		const json = JSON.parse(text.slice(UPDATE_TOKEN.length));
		console.log('update', json);
	}
};

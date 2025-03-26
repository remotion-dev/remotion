import type {MainModule} from './emscripten-types';

let transcriptionText: string[] = [];

type ModelState = {
	loading: boolean;
	transcriptionProgressPlayback: null | ((progress: number) => void);
	transcriptionChunkPlayback:
		| null
		| ((
				timestampStart: string,
				timestampEnd: string,
				textOnly: string,
		  ) => void);
	resolver: null | ((text: string) => void);
};

export const modelState: ModelState = {
	loading: false,
	transcriptionProgressPlayback: null,
	transcriptionChunkPlayback: null,
	resolver: null,
};

const printHandler = (text: string) => {
	console.log('printHandler', text);
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

export const Module = {} as MainModule;

Module.print = (text: string) => printHandler(text);
Module.printErr = (text: string) => printHandler(text);

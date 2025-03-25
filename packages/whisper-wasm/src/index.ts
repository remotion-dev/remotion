export interface transcribe{
	file: File,
	onProgress?: (p:number) => void,
	onTranscribeChunk? : (start:string, end: string, text:string) => void,
	threads?: number
}

export const transcribe = (_args: transcribe) => {
	throw new Error('cjs not supported');
};

export interface downloadWhisperModel {
	model: string,
	onProgress?: (progress: number) => void
}

export const downloadWhisperModel = async (_args:downloadWhisperModel) => {
	throw new Error("cjs not supported")
}


type ReadResult = {
	reader: ReadableStreamDefaultReader<Uint8Array>;
	contentLength: number | null;
};
type ReadContent = (
	src: string | File,
	range: [number, number] | number | null,
	signal: AbortSignal | undefined,
) => Promise<ReadResult>;
type GetLength = (src: string | File) => Promise<number>;

export type ReaderInterface = {
	read: ReadContent;
	getLength: GetLength;
};

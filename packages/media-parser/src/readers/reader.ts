type Reader = {
	reader: ReadableStreamDefaultReader<Uint8Array>;
	abort: () => void;
};

type ReadResult = {
	reader: Reader;
	contentLength: number | null;
	name: string;
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

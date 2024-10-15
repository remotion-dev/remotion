type Reader = {
	reader: ReadableStreamDefaultReader<Uint8Array>;
	abort: () => void;
};

type ReadResult = {
	reader: Reader;
	contentLength: number | null;
	name: string;
	supportsContentRange: boolean;
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

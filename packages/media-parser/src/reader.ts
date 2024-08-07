type ReadResult = {
	reader: ReadableStreamDefaultReader<Uint8Array>;
	contentLength: number | null;
};
type ReadContent = (
	src: string,
	range: [number, number] | number | null,
) => Promise<ReadResult>;
type GetLength = (src: string) => Promise<number>;

export type ReaderInterface = {
	read: ReadContent;
	getLength: GetLength;
};

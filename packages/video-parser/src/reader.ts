type ReadContent = (
	src: string,
	range: [number, number] | null,
) => Promise<ReadableStreamDefaultReader<Uint8Array>>;
type GetLength = (src: string) => Promise<number>;

export type ReaderInterface = {
	read: ReadContent;
	getLength: GetLength;
};

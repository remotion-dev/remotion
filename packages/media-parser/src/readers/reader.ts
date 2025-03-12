import type {MediaParserController} from '../media-parser-controller';
import type {ParseMediaSrc} from '../options';

export type Reader = {
	reader: ReadableStreamDefaultReader<Uint8Array>;
	abort: () => void;
};

type ReadResult = {
	reader: Reader;
	contentLength: number | null;
	contentType: string | null;
	name: string;
	supportsContentRange: boolean;
	needsContentRange: boolean;
};
export type ReadContent = (options: {
	src: ParseMediaSrc;
	range: [number, number] | number | null;
	controller: MediaParserController;
}) => Promise<ReadResult>;

export type ReadWholeAsText = (src: ParseMediaSrc) => Promise<string>;

export type CreateAdjacentFileSource = (
	relativePath: string,
	src: ParseMediaSrc,
) => string;

export type ReaderInterface = {
	read: ReadContent;
	readWholeAsText: ReadWholeAsText;
	createAdjacentFileSource: CreateAdjacentFileSource;
};

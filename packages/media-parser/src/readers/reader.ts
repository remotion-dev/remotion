import type {MediaParserController} from '../controller/media-parser-controller';
import type {LogLevel} from '../log';
import type {ParseMediaRange, ParseMediaSrc} from '../options';
import type {PrefetchCache} from './from-fetch';

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
	range: ParseMediaRange;
	controller: MediaParserController;
	logLevel: LogLevel;
	prefetchCache: PrefetchCache;
}) => Promise<ReadResult>;

export type ReadWholeAsText = (src: ParseMediaSrc) => Promise<string>;

export type PreloadContent = (options: {
	src: ParseMediaSrc;
	range: ParseMediaRange;
	logLevel: LogLevel;
	prefetchCache: PrefetchCache;
}) => void;

export type ClearPreloadCache = (options: {
	src: ParseMediaSrc;
	range: ParseMediaRange;
	logLevel: LogLevel;
	prefetchCache: PrefetchCache;
}) => void;

export type CreateAdjacentFileSource = (
	relativePath: string,
	src: ParseMediaSrc,
) => string;

export type ReaderInterface = {
	read: ReadContent;
	readWholeAsText: ReadWholeAsText;
	createAdjacentFileSource: CreateAdjacentFileSource;
	preload: PreloadContent;
};

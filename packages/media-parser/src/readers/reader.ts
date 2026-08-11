import type {MediaParserController} from '../controller/media-parser-controller';
import type {MediaParserLogLevel} from '../log';
import type {ParseMediaRange, ParseMediaSrc} from '../options';
import type {PrefetchCache} from './from-fetch';

export type Reader = {
	reader: ReadableStreamDefaultReader<Uint8Array>;
	abort: () => Promise<void>;
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
	logLevel: MediaParserLogLevel;
	prefetchCache: PrefetchCache;
}) => Promise<ReadResult>;

export type ReadWholeAsText = (src: ParseMediaSrc) => Promise<string>;

export type PreloadContent = (options: {
	src: ParseMediaSrc;
	range: ParseMediaRange;
	logLevel: MediaParserLogLevel;
	prefetchCache: PrefetchCache;
}) => void;

export type ClearPreloadCache = (options: {
	src: ParseMediaSrc;
	range: ParseMediaRange;
	logLevel: MediaParserLogLevel;
	prefetchCache: PrefetchCache;
}) => void;

export type CreateAdjacentFileSource = (
	relativePath: string,
	src: ParseMediaSrc,
) => string;

export type MediaParserReaderInterface = {
	read: ReadContent;
	readWholeAsText: ReadWholeAsText;
	createAdjacentFileSource: CreateAdjacentFileSource;
	preload: PreloadContent;
};

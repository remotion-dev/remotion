import type {MediaParserController} from '../../controller/media-parser-controller';
import type {LogLevel} from '../../log';
import type {ParseMediaSrc} from '../../options';
import type {ReaderInterface} from '../../readers/reader';
import {cachedSamplePositionsState} from './cached-sample-positions';
import {lazyMfraLoad} from './lazy-mfra-load';
import {moovState} from './moov-box';

export const isoBaseMediaState = ({
	contentLength,
	controller,
	readerInterface,
	src,
	logLevel,
}: {
	contentLength: number;
	controller: MediaParserController;
	readerInterface: ReaderInterface;
	src: ParseMediaSrc;
	logLevel: LogLevel;
}) => {
	return {
		flatSamples: cachedSamplePositionsState(),
		moov: moovState(),
		mfra: lazyMfraLoad({
			contentLength,
			controller,
			readerInterface,
			src,
			logLevel,
		}),
	};
};

export type IsoBaseMediaState = ReturnType<typeof isoBaseMediaState>;

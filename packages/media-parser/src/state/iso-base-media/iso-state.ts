import type {MediaParserController} from '../../controller/media-parser-controller';
import type {PrefetchCache} from '../../fetch';
import type {MediaParserLogLevel} from '../../log';
import type {ParseMediaSrc} from '../../options';
import type {MediaParserReaderInterface} from '../../readers/reader';
import {cachedSamplePositionsState} from './cached-sample-positions';
import {lazyMfraLoad} from './lazy-mfra-load';
import {moovState} from './moov-box';
import {precomputedMoofState} from './precomputed-moof';
import {precomputedTfraState} from './precomputed-tfra';
import {movieTimeScaleState} from './timescale-state';

export const isoBaseMediaState = ({
	contentLength,
	controller,
	readerInterface,
	src,
	logLevel,
	prefetchCache,
}: {
	contentLength: number;
	controller: MediaParserController;
	readerInterface: MediaParserReaderInterface;
	src: ParseMediaSrc;
	logLevel: MediaParserLogLevel;
	prefetchCache: PrefetchCache;
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
			prefetchCache,
		}),
		moof: precomputedMoofState(),
		tfra: precomputedTfraState(),
		movieTimeScale: movieTimeScaleState(),
	};
};

export type IsoBaseMediaState = ReturnType<typeof isoBaseMediaState>;

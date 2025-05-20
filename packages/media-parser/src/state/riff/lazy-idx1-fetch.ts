import type {FetchIdx1Result} from '../../containers/riff/seek/fetch-idx1';
import {fetchIdx1} from '../../containers/riff/seek/fetch-idx1';
import type {RiffSeekingHints} from '../../containers/riff/seeking-hints';
import type {MediaParserController} from '../../controller/media-parser-controller';
import type {PrefetchCache} from '../../fetch';
import type {MediaParserLogLevel} from '../../log';
import type {ParseMediaSrc} from '../../options';
import type {MediaParserReaderInterface} from '../../readers/reader';

export const lazyIdx1Fetch = ({
	controller,
	logLevel,
	readerInterface,
	src,
	prefetchCache,
	contentLength,
}: {
	controller: MediaParserController;
	logLevel: MediaParserLogLevel;
	readerInterface: MediaParserReaderInterface;
	src: ParseMediaSrc;
	prefetchCache: PrefetchCache;
	contentLength: number;
}) => {
	let prom: Promise<FetchIdx1Result> | null = null;
	let result: FetchIdx1Result | null = null;

	const triggerLoad = (position: number) => {
		if (result) {
			return Promise.resolve(result);
		}

		if (prom) {
			return prom;
		}

		prom = fetchIdx1({
			controller,
			logLevel,
			position,
			readerInterface,
			src,
			prefetchCache,
			contentLength,
		}).then((entries) => {
			prom = null;
			result = entries;
			return entries;
		});

		return prom;
	};

	const getLoadedIdx1 = async () => {
		if (!prom) {
			return null;
		}

		const entries = await prom;

		return entries;
	};

	const getIfAlreadyLoaded = () => {
		if (result) {
			return result;
		}

		return null;
	};

	const setFromSeekingHints = (hints: RiffSeekingHints) => {
		if (hints.idx1Entries) {
			result = hints.idx1Entries;
		}
	};

	const waitForLoaded = () => {
		if (result) {
			return Promise.resolve(result);
		}

		if (prom) {
			return prom;
		}

		return Promise.resolve(null);
	};

	return {
		triggerLoad,
		getLoadedIdx1,
		getIfAlreadyLoaded,
		setFromSeekingHints,
		waitForLoaded,
	};
};

export type LazyIdx1Fetch = ReturnType<typeof lazyIdx1Fetch>;

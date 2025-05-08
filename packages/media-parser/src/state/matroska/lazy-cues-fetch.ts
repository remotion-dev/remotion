import {fetchWebmCues} from '../../containers/webm/seek/fetch-web-cues';
import type {MatroskaCue} from '../../containers/webm/seek/format-cues';
import type {MediaParserController} from '../../controller/media-parser-controller';
import type {PrefetchCache} from '../../fetch';
import type {MediaParserLogLevel} from '../../log';
import {Log} from '../../log';
import type {ParseMediaSrc} from '../../options';
import type {MediaParserReaderInterface} from '../../readers/reader';
import type {WebmSeekingHints} from '../../seeking-hints';

export const lazyCuesFetch = ({
	controller,
	logLevel,
	readerInterface,
	src,
	prefetchCache,
}: {
	controller: MediaParserController;
	logLevel: MediaParserLogLevel;
	readerInterface: MediaParserReaderInterface;
	src: ParseMediaSrc;
	prefetchCache: PrefetchCache;
}) => {
	let prom: Promise<MatroskaCue[] | null> | null = null;
	let sOffset: number | null = null;

	let result: MatroskaCue[] | null = null;

	const triggerLoad = (position: number, segmentOffset: number) => {
		if (result) {
			return Promise.resolve(result);
		}

		if (prom) {
			return prom;
		}

		if (sOffset && sOffset !== segmentOffset) {
			throw new Error('Segment offset mismatch');
		}

		sOffset = segmentOffset;

		Log.verbose(logLevel, 'Cues box found, trying to lazy load cues');

		prom = fetchWebmCues({
			controller,
			logLevel,
			position,
			readerInterface,
			src,
			prefetchCache,
		}).then((cues) => {
			Log.verbose(logLevel, 'Cues loaded');
			result = cues;
			return cues;
		});

		return prom;
	};

	const getLoadedCues = async () => {
		if (!prom) {
			return null;
		}

		if (result) {
			if (!sOffset) {
				throw new Error('Segment offset not set');
			}

			return {
				cues: result,
				segmentOffset: sOffset,
			};
		}

		const cues = await prom;
		if (!cues) {
			return null;
		}

		if (!sOffset) {
			throw new Error('Segment offset not set');
		}

		return {
			cues,
			segmentOffset: sOffset,
		};
	};

	const getIfAlreadyLoaded = () => {
		if (result) {
			if (sOffset === null) {
				throw new Error('Segment offset not set');
			}

			return {
				cues: result,
				segmentOffset: sOffset,
			};
		}

		return null;
	};

	const setFromSeekingHints = (hints: WebmSeekingHints) => {
		result = hints.loadedCues?.cues ?? null;
		sOffset = hints.loadedCues?.segmentOffset ?? null;
	};

	return {
		triggerLoad,
		getLoadedCues,
		getIfAlreadyLoaded,
		setFromSeekingHints,
	};
};

export type LazyCuesFetch = ReturnType<typeof lazyCuesFetch>;
export type LazyCuesLoadedOrNull = Awaited<
	ReturnType<LazyCuesFetch['getLoadedCues']>
>;

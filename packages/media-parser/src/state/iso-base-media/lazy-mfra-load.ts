import type {IsoBaseMediaBox} from '../../containers/iso-base-media/base-media-box';
import {getMfraSeekingBox} from '../../containers/iso-base-media/get-mfra-seeking-box';
import type {MediaParserController} from '../../controller/media-parser-controller';
import type {PrefetchCache} from '../../fetch';
import {Log, type LogLevel} from '../../log';
import type {ParseMediaSrc} from '../../options';
import type {ReaderInterface} from '../../readers/reader';
import type {IsoBaseMediaSeekingHints} from '../../seeking-hints';

export const lazyMfraLoad = ({
	contentLength,
	controller,
	readerInterface,
	src,
	logLevel,
	prefetchCache,
}: {
	contentLength: number;
	controller: MediaParserController;
	readerInterface: ReaderInterface;
	src: ParseMediaSrc;
	logLevel: LogLevel;
	prefetchCache: PrefetchCache;
}) => {
	let prom: Promise<IsoBaseMediaBox[] | null> | null = null;
	let result: IsoBaseMediaBox[] | null = null;

	const triggerLoad = () => {
		if (prom) {
			return prom;
		}

		Log.verbose(logLevel, 'Moof box found, trying to lazy load mfra');

		prom = getMfraSeekingBox({
			contentLength,
			controller,
			readerInterface,
			src,
			logLevel,
			prefetchCache,
		}).then((boxes) => {
			Log.verbose(logLevel, 'Lazily found mfra atom.');
			result = boxes;
			return boxes;
		});
		return prom;
	};

	const getIfAlreadyLoaded = () => {
		if (result) {
			return result;
		}

		return null;
	};

	const setFromSeekingHints = (hints: IsoBaseMediaSeekingHints) => {
		result = hints.mfraAlreadyLoaded;
	};

	return {
		triggerLoad,
		getIfAlreadyLoaded,
		setFromSeekingHints,
	};
};
